import Redis, { type RedisOptions } from 'ioredis';
import { stringify, parse } from 'superjson';
import type { ICacheStore } from '../types';

const defaultSerialize = <T>(value: T): string => {
	return stringify(value);
};

const defaultDeserialize = <T>(value: string): T => {
	return parse<T>(value);
};

type SerializeFn = typeof defaultSerialize;
type DeserializeFn = typeof defaultDeserialize;

type RedisStoreOptions = RedisOptions & {
	serialize?: SerializeFn;
	deserialize?: DeserializeFn;
	timeToLive?: number;
};
export default class RedisStore implements ICacheStore {
	readonly _client!: Redis;
	readonly _timeToLive: number | undefined;
	readonly _serialize!: SerializeFn;
	readonly _deserialize!: DeserializeFn;

	constructor({
		timeToLive,
		serialize = defaultSerialize,
		deserialize = defaultDeserialize,
		...redisOptions
	}: RedisStoreOptions) {
		this._client = new Redis(redisOptions);
		this._timeToLive = timeToLive;
		this._serialize = serialize;
		this._deserialize = deserialize;
	}

	async get<T = string>(key: string): Promise<T | undefined> {
		const json = await this._client.get(key);
		if (json === null || json === undefined) return undefined;
		const value = this._deserialize<T>(json);
		return value;
	}
	async set<T>(key: string, value: T, timeToLive?: number): Promise<void> {
		timeToLive ??= this._timeToLive;
		const json = this._serialize(value);
		if (timeToLive) {
			await this._client.setex(key, timeToLive, json);
		} else {
			await this._client.set(key, json);
		}
	}
}
