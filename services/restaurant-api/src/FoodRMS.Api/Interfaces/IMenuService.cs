using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.DTOs.Menu;

namespace FoodRMS.Api.Interfaces
{
    public interface IMenuService
    {
        Task<List<MenuCategoryDto>> GetCategoriesAsync();
        Task<MenuCategoryDto> CreateCategoryAsync(MenuCategoryDto dto);
        Task<MenuCategoryDto?> UpdateCategoryAsync(int id, MenuCategoryDto dto);
        Task<bool> DeleteCategoryAsync(int id);
        
        Task<List<MenuItemDto>> GetItemsAsync(System.Guid? branchId = null);
        Task<MenuItemDto> CreateItemAsync(MenuItemDto dto);
        Task<MenuItemDto?> UpdateItemAsync(int id, MenuItemDto dto);
        Task<bool> DeleteItemAsync(int id);
    }
}
