<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    /**
     * Transforma el recurso compra/enlace afiliado en un array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'url' => $this->url,
            'price' => $this->price,
            'currency' => $this->currency,
            'active' => $this->active,
            'country' => new CountryResource($this->whenLoaded('country')),
        ];
    }
}
