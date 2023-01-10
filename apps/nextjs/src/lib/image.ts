export const getBase64 = (file: File) => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.onerror = (err) => {
			reject(err);
		};
	});
};

export const getDimensionsFromBase64Image = (base64: string) => {
	return new Promise<[number, number]>((resolve, reject) => {
		const imageEl = new Image();
		imageEl.src = base64;
		imageEl.onload = () => {
			resolve([imageEl.width, imageEl.height]);
		};
		imageEl.onerror = (err) => {
			reject(err);
		};
	});
};
