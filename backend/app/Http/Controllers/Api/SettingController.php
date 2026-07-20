<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingRequest;
use App\Http\Resources\SettingResource;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingService $settingService,
    ) {
    }

    public function index(): JsonResponse
    {
        return $this->success(new SettingResource($this->settingService->all()));
    }

    public function update(UpdateSettingRequest $request): JsonResponse
    {
        $settings = $this->settingService->update($request->validated());

        return $this->success(new SettingResource($settings), 'Pengaturan berhasil diperbarui');
    }
}
