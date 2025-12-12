addEventListener('message', async ({ data }) => {
  const { file, quality = 0.6, maxWidth = 512, maxHeight = 512 } = data as {
    file: File;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const imageBitmap = await createImageBitmap(blob);

    const ratio = Math.min(
      maxWidth / imageBitmap.width,
      maxHeight / imageBitmap.height,
      1
    );

    const targetWidth = Math.round(imageBitmap.width * ratio);
    const targetHeight = Math.round(imageBitmap.height * ratio);

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot get 2D context');
    }
    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    const blobResult = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      postMessage({ success: true, dataUrl: reader.result });
    };
    reader.onerror = () => {
      postMessage({ success: false, error: 'Failed to read compressed image' });
    };
    reader.readAsDataURL(blobResult);
  } catch (error: any) {
    postMessage({ success: false, error: error?.message ?? 'Compression failed' });
  }
});





