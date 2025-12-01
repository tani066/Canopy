"use client";
import React from "react";

export default function WhatsAppButton({ phone, productName, className = "" }) {
  const message = `Hi! I'm interested in your product: ${productName}. Is it still available?`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative inline-flex items-center justify-center gap-2.5 
        px-5 py-2.5 rounded-full 
        bg-[#25D366] hover:bg-[#20bd5a] text-white 
        text-sm font-semibold tracking-wide 
        shadow-sm hover:shadow-lg hover:shadow-green-500/30
        transition-all duration-300 ease-out 
        hover:-translate-y-0.5 active:translate-y-0
        ${className}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
      >
        <path d="M17.472 14.382c-.297.835-1.722 1.59-2.383 1.648-.64.06-1.45.085-2.338-.15-.548-.14-1.255-.41-2.176-.99-3.826-2.387-6.177-5.544-6.38-5.807-.204-.264-1.525-2.03-1.525-3.872 0-1.842.96-2.747 1.302-3.127.341-.38.74-.476.988-.476.249 0 .498 0 .716.013.23.012.538-.087.843.646.297.72 1.005 2.5 1.095 2.683.09.183.15.398.02.66-.129.262-.197.426-.388.658-.19.232-.41.518-.586.696-.19.19-.388.397-.167.777.222.38.988 1.623 2.126 2.63 1.464 1.264 2.694 1.66 3.074 1.838.38.178.603.153.83-.093.228-.246.953-1.11 1.206-1.492.253-.38.506-.32.843-.19.338.13 2.142 1.01 2.51 1.19.367.18.61.277.7.432.09.154.09.897-.207 1.732z"/>
        <path d="M20.52 3.48A10.5 10.5 0 003.48 20.52l-1.11 3.99 4.02-1.05A10.5 10.5 0 1020.52 3.48zm-9.02 17.57c-1.69 0-3.32-.45-4.76-1.3l-.34-.2-2.38.62.64-2.31-.22-.35a9.5 9.5 0 111.9 1.88 9.44 9.44 0 004.16 1.66z"/>
      </svg>
      {/* <span>Chat with Seller</span> */}
    </a>
  );
}