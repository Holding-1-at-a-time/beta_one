"use client";

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

interface FileUploadsComponentProps {
    onUploadsComplete: (files: Array<{ url: string; type: string; name: string }>) => void;
}

const FileUploadsComponent: React.FC<FileUploadsComponentProps> = ({ onUploadsComplete }) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();
    const uploadPhotoMetadata = useMutation(api.assessments.uploadPhotoMetadata);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const validFiles = Array.from(files).filter(file =>
            (ALLOWED_IMAGE_TYPES.includes(file.type) || ALLOWED_VIDEO_TYPES.includes(file.type)) &&
            file.size <= MAX_FILE_SIZE
        );

        if (validFiles.length === 0) {
            toast({
                title: "Invalid files",
                description: "Please select valid image or video files under 10MB.",
                variant: "destructive",
            });
            return;
        }

        try {
            const uploadedFiles = await Promise.all(validFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

                const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                return { url: data.secure_url, type: file.type, name: file.name };
            }));

            await uploadPhotoMetadata({ files: uploadedFiles });
            onUploadsComplete(uploadedFiles);

            toast({
                title: "Upload successful",
                description: `${uploadedFiles.length} file(s) uploaded successfully.`,
            });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "An error occurred while uploading files. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploadProgress(0);
        }
    };

    return (
        <div className="space-y-4">
            <input
                type="file"
                multiple
                accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
            />
            <label htmlFor="file-upload">
                <Button as="span">Select Files</Button>
            </label>
            {uploadProgress > 0 && <Progress value={uploadProgress} className="w-full" />}
        </div>
    );
};

export default FileUploadsComponent;