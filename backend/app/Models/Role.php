<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    public function users(): MorphToMany
    {
        return $this->morphedByMany(
            User::class,
            'model',
            config('permission.table_names.model_has_roles'),
            app(\Spatie\Permission\PermissionRegistrar::class)->pivotRole,
            config('permission.column_names.model_morph_key'),
        );
    }
}
