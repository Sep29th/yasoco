/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ReactCrop, { Crop as CropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import uploadImage from "@/lib/upload-image";
import { toast } from "sonner";

type ImageUploadCropProps = {
	value?: string;
	onChange: (url: string) => void;
	disabled?: boolean;
	aspectRatio?: number;
};

export default function ImageUploadCrop({
	value,
	onChange,
	disabled = false,
	aspectRatio = 1.7,
}: ImageUploadCropProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [originalFile, setOriginalFile] = useState<File | null>(null);
	const [crop, setCrop] = useState<CropType>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const [showCropDialog, setShowCropDialog] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);

	const paddingBottomPercentage = `${(1 / aspectRatio) * 100}%`;

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Vui lòng chọn file ảnh", { position: "top-right" });
			return;
		}

		setOriginalFile(file);
		const reader = new FileReader();
		reader.onload = () => {
			setPreviewUrl(reader.result as string);
			setShowCropDialog(true);
		};
		reader.readAsDataURL(file);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleCancel = () => {
		setShowCropDialog(false);
		setPreviewUrl(null);
		setOriginalFile(null);
		setCrop(undefined);
		setCompletedCrop(undefined);
	};

	const onImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const { width, height } = e.currentTarget;

			if (width < 100 || height < 100) {
				toast.error("Ảnh quá nhỏ, vui lòng chọn ảnh có kích thước lớn hơn", {
					position: "top-right",
				});
				handleCancel();
				return;
			}

			let cropWidth = width;
			let cropHeight = width / aspectRatio;

			if (cropHeight > height) {
				cropHeight = height;
				cropWidth = height * aspectRatio;
			}

			const x = (width - cropWidth) / 2;
			const y = (height - cropHeight) / 2;

			const newCrop: CropType = {
				unit: "px",
				x,
				y,
				width: cropWidth,
				height: cropHeight,
			};

			setCrop(newCrop);
			setCompletedCrop(newCrop as PixelCrop);
		},
		[aspectRatio]
	);

	const getCroppedImg = useCallback(
		async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
			const canvas = document.createElement("canvas");
			const scaleX = image.naturalWidth / image.width;
			const scaleY = image.naturalHeight / image.height;

			canvas.width = crop.width * scaleX;
			canvas.height = crop.height * scaleY;

			const ctx = canvas.getContext("2d");
			if (!ctx) return null;

			ctx.imageSmoothingQuality = "high";

			ctx.drawImage(
				image,
				crop.x * scaleX,
				crop.y * scaleY,
				crop.width * scaleX,
				crop.height * scaleY,
				0,
				0,
				canvas.width,
				canvas.height
			);

			return new Promise((resolve) => {
				canvas.toBlob(
					(blob) => {
						resolve(blob);
					},
					"image/jpeg",
					0.95
				);
			});
		},
		[]
	);

	const handleCropComplete = async () => {
		if (!completedCrop || !imgRef.current || !originalFile) {
			toast.error("Vui lòng chọn vùng cắt trước khi xác nhận", {
				position: "top-right",
			});
			return;
		}

		if (completedCrop.width < 10 || completedCrop.height < 10) {
			toast.error("Vùng cắt quá nhỏ, vui lòng chọn vùng lớn hơn", {
				position: "top-right",
			});
			return;
		}

		setIsUploading(true);
		try {
			const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
			if (!croppedBlob) {
				toast.error("Không thể cắt ảnh, vui lòng thử lại", {
					position: "top-right",
				});
				return;
			}

			const croppedFile = new File([croppedBlob], originalFile.name, {
				type: "image/jpeg",
			});

			const formData = new FormData();
			formData.append("file", croppedFile);

			const result = await uploadImage(formData);

			if (result.success && result.url) {
				onChange(result.url);
				setShowCropDialog(false);
				setPreviewUrl(null);
				setOriginalFile(null);
				toast.success("Upload ảnh thành công", { position: "top-right" });
			} else {
				toast.error(result.error || "Upload thất bại", {
					position: "top-right",
				});
			}
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Có lỗi xảy ra khi upload ảnh", { position: "top-right" });
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemove = () => {
		onChange("");
	};

	return (
		<div className="space-y-2 w-full">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled}
			/>

			{value ? (
				<div className="relative group w-full rounded-lg overflow-hidden border">
					<div style={{ paddingBottom: paddingBottomPercentage }} />
					<img
						src={value}
						alt="Cover"
						className="absolute inset-0 w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
						<Button
							type="button"
							size="sm"
							variant="secondary"
							onClick={() => fileInputRef.current?.click()}
							disabled={disabled}
						>
							<Upload className="h-4 w-4 mr-2" />
							Thay đổi
						</Button>
						<Button
							type="button"
							size="sm"
							variant="destructive"
							onClick={handleRemove}
							disabled={disabled}
						>
							<X className="h-4 w-4 mr-2" />
							Xóa
						</Button>
					</div>
				</div>
			) : (
				<div className="relative w-full rounded-lg overflow-hidden">
					<div style={{ paddingBottom: paddingBottomPercentage }} />
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={disabled}
						className={cn(
							"absolute inset-0 h-full w-full border-2 border-dashed rounded-lg",
							"flex flex-col items-center justify-center gap-2",
							"hover:border-primary hover:bg-primary/5 transition-colors",
							"text-muted-foreground hover:text-primary",
							"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
						)}
					>
						<Upload className="h-8 w-8" />
						<span className="text-sm font-medium">Click để tải ảnh lên</span>
						<span className="text-xs text-muted-foreground">
							Tỉ lệ yêu cầu: {aspectRatio}:1
						</span>
					</button>
				</div>
			)}
			<Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
				<DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-hidden flex flex-col p-0 gap-0 sm:max-w-6xl sm:h-auto sm:max-h-[90vh]">
					<DialogHeader className="p-6 pb-2">
						<DialogTitle>Cắt ảnh</DialogTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Kéo và thay đổi kích thước vùng cắt. Tỉ lệ {aspectRatio}:1 sẽ được
							giữ nguyên.
						</p>
					</DialogHeader>

					<div className="flex-1 overflow-auto p-6 pt-2 w-full h-full bg-accent/30 flex items-center justify-center">
						{previewUrl && (
							<ReactCrop
								crop={crop}
								onChange={(c) => setCrop(c)}
								onComplete={(c) => setCompletedCrop(c)}
								aspect={aspectRatio}
								minWidth={100}
								className="max-h-full max-w-full"
							>
								<img
									ref={imgRef}
									src={previewUrl}
									alt="Preview"
									onLoad={onImageLoad}
									className="max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)] w-auto object-contain mx-auto"
									style={{ maxWidth: "100%" }}
								/>
							</ReactCrop>
						)}
					</div>
					<DialogFooter className="p-6 pt-2 bg-background z-10">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isUploading}
						>
							Hủy
						</Button>
						<Button
							type="button"
							onClick={handleCropComplete}
							disabled={!completedCrop || isUploading}
							className="bg-[#A6CF52] hover:bg-[#94B846]"
						>
							{isUploading ? (
								<>Đang tải lên...</>
							) : (
								<>
									<Check className="h-4 w-4 mr-2" />
									Xác nhận
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
