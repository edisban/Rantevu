package com.rantevu.backend.message;

import com.rantevu.backend.security.JwtService;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// Live delivery only: clients subscribe to /user/queue/messages; sending goes through the REST API
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtService jwt;
    public WebSocketConfig(JwtService jwt) { this.jwt = jwt; }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws"); // same-origin only (the default)
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                var stomp = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (stomp == null || stomp.getCommand() == null) return message;
                switch (stomp.getCommand()) {
                    case CONNECT -> {
                        String header = stomp.getFirstNativeHeader("Authorization");
                        if (header == null || !header.startsWith("Bearer ")) throw new MessageDeliveryException("Missing token");
                        try {
                            stomp.setUser(jwt.authenticate(header.substring(7)));
                        } catch (RuntimeException e) {
                            throw new MessageDeliveryException("Invalid token");
                        }
                    }
                    // Only a user's own queue can be subscribed to, and clients never publish
                    case SUBSCRIBE -> {
                        String dest = stomp.getDestination();
                        if (stomp.getUser() == null || dest == null || !dest.equals("/user" + MessageService.USER_QUEUE))
                            throw new MessageDeliveryException("Subscription not allowed");
                    }
                    case SEND -> throw new MessageDeliveryException("Send messages through the REST API");
                    default -> { }
                }
                return message;
            }
        });
    }
}
