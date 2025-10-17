import { useState } from 'react';

interface CarImage {
    id: number;
    image_url: string;
    display_order: number;
    is_primary: boolean;
}

interface CarImageGalleryProps {
    images: CarImage[];
    carName: string;
}

/**
 * Car Image Gallery
 * Professional photo gallery with large main image and thumbnail grid
 * Design inspired by Turo/Airbnb - clean, minimal, photo-focused
 */
export function CarImageGallery({ images, carName }: CarImageGalleryProps) {
    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
    const [selectedImage, setSelectedImage] = useState(sortedImages[0] || null);

    if (!sortedImages.length) {
        return (
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-gray-400">No images available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[16/10]">
                <img
                    src={selectedImage?.image_url || sortedImages[0].image_url}
                    alt={carName}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {sortedImages.map((image) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImage(image)}
                            className={`
                                relative overflow-hidden rounded-lg aspect-[4/3]
                                transition-all duration-200 hover:opacity-100
                                ${
                                    selectedImage?.id === image.id
                                        ? 'ring-2 ring-blue-600 opacity-100'
                                        : 'opacity-60'
                                }
                            `}
                        >
                            <img
                                src={image.image_url}
                                alt={`${carName} - Image ${image.display_order}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
