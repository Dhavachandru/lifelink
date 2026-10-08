package com.lifelink.os.service.storage;

public interface StorageService {
    String storeFile(byte[] content, String originalFilename, String contentType);
    byte[] loadFile(String fileKey);
    void deleteFile(String fileKey);
}
