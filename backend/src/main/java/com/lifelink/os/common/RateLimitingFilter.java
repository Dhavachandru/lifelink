package com.lifelink.os.common;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private static final int MAX_REQUESTS_PER_MINUTE = 200;
    private final Map<String, RequestCounter> clientCounters = new ConcurrentHashMap<>();

    private static class RequestCounter {
        final long resetTime;
        final AtomicInteger count;

        RequestCounter(long resetTime) {
            this.resetTime = resetTime;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String ip = getClientIp(httpRequest);
        long now = System.currentTimeMillis();

        RequestCounter counter = clientCounters.compute(ip, (key, existing) -> {
            if (existing == null || now > existing.resetTime) {
                return new RequestCounter(now + 60000); // 1 minute window
            }
            existing.count.incrementAndGet();
            return existing;
        });

        // Add rate limit headers
        httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        httpResponse.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, MAX_REQUESTS_PER_MINUTE - counter.count.get())));

        if (counter.count.get() > MAX_REQUESTS_PER_MINUTE) {
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"success\":false,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again shortly.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
