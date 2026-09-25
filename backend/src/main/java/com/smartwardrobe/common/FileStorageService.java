package com.smartwardrobe.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path uploadLocation;
    private final Cloudinary cloudinary;
    private final boolean isCloudinaryEnabled;

    public FileStorageService(
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret
    ) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory at " + this.uploadLocation, e);
        }

        if (cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName.trim(),
                    "api_key", apiKey.trim(),
                    "api_secret", apiSecret.trim(),
                    "secure", true
            ));
            this.isCloudinaryEnabled = true;
            log.info("☁️ Cloudinary image storage successfully configured with cloud_name: {}", cloudName);
        } else {
            this.cloudinary = null;
            this.isCloudinaryEnabled = false;
            log.info("📁 Cloudinary credentials not provided. Using local disk upload storage at: {}", this.uploadLocation);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        if (isCloudinaryEnabled && cloudinary != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "smartwardrobe",
                                "resource_type", "image"
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Uploaded image to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception e) {
                log.error("Cloudinary upload failed, falling back to local disk storage", e);
            }
        }

        // Local storage fallback
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            extension = ".png";
        }

        String filename = UUID.randomUUID() + extension;
        Path targetPath = this.uploadLocation.resolve(filename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + filename, e);
        }
    }

    public String storeBytes(byte[] data, String extension) {
        if (isCloudinaryEnabled && cloudinary != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        data,
                        ObjectUtils.asMap(
                                "folder", "smartwardrobe",
                                "resource_type", "image"
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Uploaded byte array to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception e) {
                log.error("Cloudinary upload failed for byte data, falling back to disk", e);
            }
        }

        String filename = UUID.randomUUID() + (extension.startsWith(".") ? extension : "." + extension);
        Path targetPath = this.uploadLocation.resolve(filename);
        try {
            Files.write(targetPath, data);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store byte data as " + filename, e);
        }
    }

    public String storeBase64(String base64Data) {
        if (base64Data == null || !base64Data.startsWith("data:image")) {
            return base64Data;
        }
        try {
            String[] parts = base64Data.split(",");
            if (parts.length < 2) return base64Data;
            String header = parts[0];
            String data = parts[1];
            String extension = ".png";
            if (header.contains("jpeg") || header.contains("jpg")) extension = ".jpg";
            else if (header.contains("webp")) extension = ".webp";
            byte[] decoded = java.util.Base64.getDecoder().decode(data);
            return storeBytes(decoded, extension);
        } catch (Exception e) {
            return base64Data;
        }
    }

    public byte[] loadFileAsBytes(String fileRelativeUrl) {
        if (fileRelativeUrl == null || fileRelativeUrl.isBlank()) {
            return new byte[0];
        }

        // Support remote Cloudinary / HTTPS URLs
        if (fileRelativeUrl.startsWith("http://") || fileRelativeUrl.startsWith("https://")) {
            try (InputStream in = URI.create(fileRelativeUrl).toURL().openStream()) {
                return in.readAllBytes();
            } catch (Exception e) {
                log.warn("Could not download image from remote URL: {}", fileRelativeUrl, e);
                return new byte[0];
            }
        }

        try {
            String filename = fileRelativeUrl.replace("/uploads/", "");
            Path filePath = this.uploadLocation.resolve(filename).normalize();
            if (Files.exists(filePath)) {
                return Files.readAllBytes(filePath);
            }
            return new byte[0];
        } catch (IOException e) {
            return new byte[0];
        }
    }
}
