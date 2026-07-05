using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FoodRMS.Api.Entities;
using FoodRMS.Api.Data;
using FoodRMS.Api.DTOs.Menu;
using Microsoft.EntityFrameworkCore;

using FoodRMS.Api.Interfaces;

namespace FoodRMS.Api.Infrastructure.Services
{
    public class MenuService : IMenuService
    {
        private readonly FoodRMSDbContext _context;

        public MenuService(FoodRMSDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuCategoryDto>> GetCategoriesAsync()
        {
            return await _context.MenuCategories
                .Select(c => new MenuCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Icon = c.Icon,
                    ImageUrl = c.ImageUrl
                }).ToListAsync();
        }

        public async Task<MenuCategoryDto> CreateCategoryAsync(MenuCategoryDto dto)
        {
            var category = new MenuCategory
            {
                Name = dto.Name,
                Icon = dto.Icon,
                ImageUrl = dto.ImageUrl
            };
            _context.MenuCategories.Add(category);
            await _context.SaveChangesAsync();
            dto.Id = category.Id;
            return dto;
        }

        public async Task<MenuCategoryDto?> UpdateCategoryAsync(int id, MenuCategoryDto dto)
        {
            var category = await _context.MenuCategories.FindAsync(id);
            if (category == null) return null;

            category.Name = dto.Name;
            category.Icon = dto.Icon;
            category.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.MenuCategories.FindAsync(id);
            if (category == null) return false;
            _context.MenuCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MenuItemDto>> GetItemsAsync(System.Guid? branchId = null)
        {
            var query = _context.MenuItems.AsQueryable();
            if (branchId.HasValue)
            {
                query = query.Where(i => !i.BranchId.HasValue || i.BranchId == branchId.Value);
            }

            return await query
                .Select(i => new MenuItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description,
                    ImageUrl = i.ImageUrl,
                    Price = i.Price,
                    CategoryId = i.CategoryId,
                    BranchId = i.BranchId,
                    KitchenStationId = i.KitchenStationId
                }).ToListAsync();
        }

        public async Task<MenuItemDto> CreateItemAsync(MenuItemDto dto)
        {
            var item = new MenuItem
            {
                Name = dto.Name,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                BranchId = dto.BranchId,
                KitchenStationId = dto.KitchenStationId
            };
            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();
            dto.Id = item.Id;
            return dto;
        }

        public async Task<MenuItemDto?> UpdateItemAsync(int id, MenuItemDto dto)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return null;

            item.Name = dto.Name;
            item.Description = dto.Description;
            item.ImageUrl = dto.ImageUrl;
            item.Price = dto.Price;
            item.CategoryId = dto.CategoryId;
            item.BranchId = dto.BranchId;
            item.KitchenStationId = dto.KitchenStationId;

            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteItemAsync(int id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return false;
            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
