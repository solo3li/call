using System;
using System.ComponentModel.DataAnnotations;

namespace FoodRMS.Api.Areas.Api.DTOs.KitchenStations
{
    public class KitchenStationDto
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public Guid? BranchId { get; set; }
    }
}
