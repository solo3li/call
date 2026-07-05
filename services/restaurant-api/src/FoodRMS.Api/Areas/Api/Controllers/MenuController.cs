using FoodRMS.Api.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodRMS.Api.Infrastructure.Services;
using FoodRMS.Api.DTOs.Menu;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;

namespace FoodRMS.Api.Areas.Api.Controllers
{
    public class MenuUploadDto
    {
        public IFormFile file { get; set; }
    }

    [Area("Api")]
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<IActionResult> UploadImage([FromForm] MenuUploadDto dto)
        {
            var file = dto.file;
            if (file == null || file.Length == 0)
            {
                return BadRequest("لم يتم تحديد ملف أو الملف فارغ.");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "menu");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = "/uploads/menu/" + uniqueName;
            return Ok(new { url = fileUrl });
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<List<MenuCategoryDto>>> GetCategories()
        {
            return await _menuService.GetCategoriesAsync();
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<ActionResult<MenuCategoryDto>> CreateCategory([FromBody] MenuCategoryDto dto)
        {
            var result = await _menuService.CreateCategoryAsync(dto);
            return Ok(result);
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<ActionResult<MenuCategoryDto>> UpdateCategory(int id, [FromBody] MenuCategoryDto dto)
        {
            var result = await _menuService.UpdateCategoryAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("categories/{id}")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var success = await _menuService.DeleteCategoryAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("items")]
        [AllowAnonymous]
        public async Task<ActionResult<List<MenuItemDto>>> GetItems([FromQuery] System.Guid? branchId)
        {
            return await _menuService.GetItemsAsync(branchId);
        }

        [HttpGet("public/{tenantId}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetPublicMenu(System.Guid tenantId, [FromQuery] System.Guid? branchId, [FromServices] ITenantService tenantService)
        {
            tenantService.SetTenant(tenantId);
            var categories = await _menuService.GetCategoriesAsync();
            var items = await _menuService.GetItemsAsync(branchId);
            return Ok(new { categories, items });
        }

        [HttpPost("items")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<ActionResult<MenuItemDto>> CreateItem([FromBody] MenuItemDto dto)
        {
            var result = await _menuService.CreateItemAsync(dto);
            return Ok(result);
        }

        [HttpPut("items/{id}")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<ActionResult<MenuItemDto>> UpdateItem(int id, [FromBody] MenuItemDto dto)
        {
            var result = await _menuService.UpdateItemAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("items/{id}")]
        [Authorize(Roles = "Owner,Chief")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var success = await _menuService.DeleteItemAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
