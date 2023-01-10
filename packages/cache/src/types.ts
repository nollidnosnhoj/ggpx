export interface ICacheStore {
	get<T = string>(key: string): Promise<T | undefined>;
	set<T>(key: string, value: T, timeToLive?: number): Promise<void>;
}
