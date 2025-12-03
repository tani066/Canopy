"use client";
import Image from "next/image";
import React from "react";

export default function WhatsAppButton({ phone, productName, type = 'product', className = "", compact = true }) {
  const noun = type === 'service' ? 'service' : 'product';
  const message = `Hi! I'm interested in your ${noun}: ${productName}. Is it still available?`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      >
      <Image src="/WhatsApp.svg.webp" alt="wh" width={37} height={37}  />

      {compact ? <span className="sr-only">Chat with Seller</span> : <span>Chat with Seller</span>}
    </a>
  );
}
