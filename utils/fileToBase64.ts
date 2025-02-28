export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}