<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $customerService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->customerService->paginate($request->only([
            'search', 'is_active', 'sort', 'direction', 'per_page',
        ]))->through(fn (Customer $customer) => new CustomerResource($customer));

        return $this->paginated($paginator);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = $this->customerService->create($request->validated());

        return $this->success(new CustomerResource($customer), 'Customer berhasil dibuat', 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return $this->success(new CustomerResource($customer));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer = $this->customerService->update($customer, $request->validated());

        return $this->success(new CustomerResource($customer), 'Customer berhasil diperbarui');
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->customerService->delete($customer);

        return $this->success(null, 'Customer berhasil dihapus');
    }
}
