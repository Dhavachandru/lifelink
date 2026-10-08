package com.lifelink.os.service.storage;

import com.lifelink.os.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path uploadDirectory;

    public LocalStorageService(@Value("${storage.local.upload-dir:./lifelink-uploads}") String uploadDir) {
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDirectory);
            log.info("Initialized local storage upload directory at: {}", this.uploadDirectory);
        } catch (IOException e) {
            log.error("Could not create upload directory at: {}", this.uploadDirectory, e);
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String storeFile(byte[] content, String originalFilename, String contentType) {
        String cleanOriginalName = (originalFilename != null) ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "file.bin";
        String uniqueKey = UUID.randomUUID() + "_" + cleanOriginalName;
        Path targetPath = this.uploadDirectory.resolve(uniqueKey).normalize();

        // Prevent path traversal
        if (!targetPath.startsWith(this.uploadDirectory)) {
            throw new SecurityException("Cannot store file outside target directory");
        }

        try {
            Files.write(targetPath, content);
            log.info("Stored file successfully with key: {}", uniqueKey);
            return uniqueKey;
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public byte[] loadFile(String fileKey) {
        Path filePath = this.uploadDirectory.resolve(fileKey).normalize();
        if (!filePath.startsWith(this.uploadDirectory) || !Files.exists(filePath)) {
            throw new ResourceNotFoundException("File not found or access denied for key: " + fileKey);
        }
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Failed to read file: {}", fileKey, e);
            throw new RuntimeException("Failed to read file", e);
        }
    }

    @Override
    public void deleteFile(String fileKey) {
        Path filePath = this.uploadDirectory.resolve(fileKey).normalize();
        if (filePath.startsWith(this.uploadDirectory) && Files.exists(filePath)) {
            try {
                Files.delete(filePath);
                log.info("Deleted file key: {}", fileKey);
            } catch (IOException e) {
                log.warn("Could not delete file key: {}", fileKey, e);
            }
        }
    }
}
