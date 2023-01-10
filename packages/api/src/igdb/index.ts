import type { z } from "zod";
import type { ICacheStore } from "@ggpx/cache";
import { IGDB_TOKEN_KEY } from "./constants";
import { accessTokenSchema, gamesSchema } from "./schemas";
import type { AccessToken, IgdbGame } from "./types";
import { wait } from "./utils";

type IgdbClientConfig = {
  clientId: string;
  clientSecret: string;
};

export default class IgdbClient {
  private readonly _cache!: ICacheStore;
  private readonly _config!: IgdbClientConfig;

  constructor(opts: IgdbClientConfig, cache: ICacheStore) {
    this._config = opts;
    this._cache = cache;
    this.validateConfig(opts);
  }

  public async getGame(id: number) {
    const [game] = await this.getGames([id]);
    return game;
  }

  public async getGames(
    ids: number[],
    offset?: number,
    take?: number,
  ): Promise<IgdbGame[]> {
    if (!ids) return [];
    const idsQuery = `(${ids.join(",")})`;
    let body = `fields name, slug, cover.id, cover.image_id, cover.url, cover.checksum; where ${idsQuery} version_parent = null & parent_game = null & (category = 0 | category = 9);`;
    if (take) {
      body += ` limit ${take};`;
    }
    if (offset) {
      body += ` offset ${offset};`;
    }
    const accessToken = await this._getAccessToken();
    return await this._request("games", body, false, accessToken, gamesSchema);
  }

  public async searchGames(query: string, take: number) {
    const ttl = 60 * 60 * 24 * 7;
    const cacheKey = `igdb:search:${query}`;
    const cachedResult = await this._cache.get<IgdbGame[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    const body = `fields name, slug, cover.id, cover.image_id, cover.url, cover.checksum; search "${query}"; where version_parent = null & parent_game = null & (category = 0 | category = 9); limit ${take};`;
    const accessToken = await this._getAccessToken();
    const result = await this._request(
      "games",
      body,
      false,
      accessToken,
      gamesSchema,
    );
    await this._cache.set(cacheKey, result, ttl);
    return result;
  }

  private validateConfig(config: IgdbClientConfig) {
    if (!config.clientId || !config.clientSecret) {
      throw new Error("Twitch client id and secret are required.");
    }
  }

  private async _getAccessToken(): Promise<AccessToken> {
    const cachedAccessToken = await this._cache.get<AccessToken>(
      IGDB_TOKEN_KEY,
    );
    if (cachedAccessToken) {
      return cachedAccessToken;
    }
    const { clientId, clientSecret } = this._config;
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });
    const url = `https://id.twitch.tv/oauth2/token${params.toString()}`;
    const response = await fetch(url, {
      method: "POST",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const responseJson = await response.json();
    const validationResult = await accessTokenSchema.safeParseAsync(
      responseJson,
    );
    if (validationResult.success) {
      await this._cache.set(IGDB_TOKEN_KEY, validationResult.data.access_token);
      return validationResult.data;
    }
    throw new Error("Unable to retrieve twitch access token.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _request<T = any>(
    resource: string,
    query: string,
    count: boolean,
    accessToken: AccessToken,
    schema?: z.ZodType<T>,
    retry = true,
  ): Promise<T> {
    const url = `https://api.igdb.com/v4/${resource}/${count ? "count/" : ""}`;
    const response = await fetch(url, {
      body: query,
      method: "post",
      headers: {
        "Client-ID": this._config.clientId,
        Authorization: `Bearer ${accessToken.access_token}`,
      },
    });

    if (response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const obj = await response.json();
      if (!schema) return obj as T;
      const result = await schema.safeParseAsync(obj);
      if (result.success) return result.data;
      throw new Error("Unable to parse IGDB result with provided schema.");
    }

    const authFailed = response.status === 401 || response.status === 403;
    if (authFailed && retry) {
      accessToken = await this._getAccessToken();
      return await this._request(
        resource,
        query,
        count,
        accessToken,
        schema,
        false,
      );
    }
    if (authFailed) {
      throw new Error("Not authorized in IGDB.");
    }

    if (response.status === 429) {
      await wait(400);
      return await this._request(resource, query, count, accessToken, schema);
    }

    throw new Error("Unable to execute Igdb query.");
  }
}
