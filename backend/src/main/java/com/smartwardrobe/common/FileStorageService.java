package com.smartwardrobe.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory at " + this.uploadLocation, e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

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
