<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    /**
     * Transforma el recurso país en un array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone_code' => $this->phone_code,
            'iso_code' => $this->iso_code,
            'currency' => $this->currency,
            'continent' => $this->continent,
        ];
    }
}
