import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import type { IStorage } from '../types';
import type { GetPresignedPostOptions, GetPresignedPostResult } from '../types';

export default class S3Storage implements IStorage {
	private readonly _client!: S3Client;

	constructor(opts: S3ClientConfig) {
		this._client = new S3Client(opts);
	}

	public async getPresignedPost({
		container,
		key,
		expiration,
		fields = {}
	}: GetPresignedPostOptions): Promise<GetPresignedPostResult> {
		const result = await createPresignedPost(this._client, {
			Bucket: container,
			Key: key,
			Expires: expiration,
			Fields: {
				...fields
			}
		});
		return {
			url: result.url,
			fields: result.fields
		};
	}
}
