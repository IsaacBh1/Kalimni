using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChatApp_Backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Bio { get; set; } = string.Empty;

        [MaxLength(2048)]
        public string ProfilePictureUrl { get; set; } = string.Empty;

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public bool IsOnline { get; set; } = false;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<GroupMember> GroupMemberships { get; set; } = new List<GroupMember>();

        public ICollection<User> Friends { get; set; } = new List<User>();
    }
}