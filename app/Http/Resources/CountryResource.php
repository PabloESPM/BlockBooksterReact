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
            'id'         => $this->id,
            'name'       => $this->name,
            'alpha2'     => $this->alpha2,
            'iso_code'   => $this->iso_code,
            'phone_code' => $this->phone_code,
            'currency'   => $this->currency,
            'continent'  => $this->continent,
            'timezone'   => $this->timezone,
            'emoji'      => $this->emoji,
        ];
    }
}
