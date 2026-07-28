const createPlaceholder = (width, height, text, bgColor = '#f3f4f6', textColor = '#9ca3af') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <rect width="100%" height="100%" fill="none" stroke="#e5e7eb" stroke-width="2"/>
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const servicePlaceholder = createPlaceholder(400, 300, 'Service Image');
export const serviceDetailPlaceholder = createPlaceholder(800, 600, 'Service Image');
export const dishPlaceholder = createPlaceholder(300, 200, 'Dish Image');
export const avatarPlaceholder = createPlaceholder(150, 150, 'Avatar', '#e5e7eb', '#6b7280');
