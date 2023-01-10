export type Fields = Record<string, string>;
export type GetPresignedPostOptions = {
	container: string;
	key: string;
	expiration: number;
	size: number;
	fields?: Fields;
};
export type GetPresignedPostResult = {
	url: string;
	fields: Fields;
};

export interface IStorage {
	getPresignedPost(opts: GetPresignedPostOptions): Promise<GetPresignedPostResult>;
}
