using System;

namespace FoodRMS.Api.Entities
{
    public class SupportMessage
    {
        public Guid Id { get; set; }
        public Guid SupportTicketId { get; set; }
        public string Sender { get; set; } = string.Empty; // "Admin", "Tenant", "Customer"
        public string Text { get; set; } = string.Empty;
        
        // Message Type: Text, Audio, Image, Video, File
        public string MessageType { get; set; } = "Text"; 
        
        public string? AttachmentUrl { get; set; }
        public string? AttachmentName { get; set; }
        
        public Guid? ReplyToMessageId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public SupportTicket? SupportTicket { get; set; }
        public SupportMessage? ReplyToMessage { get; set; }
    }
}