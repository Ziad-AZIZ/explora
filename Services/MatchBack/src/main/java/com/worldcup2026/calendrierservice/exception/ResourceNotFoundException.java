package com.worldcup2026.calendrierservice.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " introuvable (id=" + id + ")");
    }
}
