using System;

namespace FoodRMS.Api.Entities
{
    /// <summary>
    /// Casbin policy rule stored in the public schema.
    /// Supports the RBAC with domains model: (p, sub, dom, obj, act).
    /// </summary>
    public class CasbinRule
    {
        public int Id { get; set; }

        /// <summary>Policy type: "p" for policy, "g" for grouping (role assignment).</summary>
        public string PType { get; set; } = string.Empty;

        /// <summary>V0: subject (user ID or role name)</summary>
        public string? V0 { get; set; }

        /// <summary>V1: domain (tenantId)</summary>
        public string? V1 { get; set; }

        /// <summary>V2: object (resource, e.g. "orders", "menu", "*")</summary>
        public string? V2 { get; set; }

        /// <summary>V3: action (e.g. "read", "write", "*")</summary>
        public string? V3 { get; set; }

        public string? V4 { get; set; }
        public string? V5 { get; set; }
    }
}
