<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Country;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => substr($this->faker->name(), 0, 25),
            'email' => $this->faker->unique()->safeEmail(),
            'telephone' => $this->faker->phoneNumber(),
            'password' => Hash::make('password'),
            'date_of_birth' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['Male', 'Female', 'Other']),
            'bio' => $this->faker->optional(0.8)->realTextBetween(50, 300),
            'profile_visibility' => $this->faker->randomElement([
                'public',
                'followers',
                'friends',
                'private',
            ]),
            'country_id' => Country::inRandomOrder()->first()->id
                ?? Country::factory(),
            'type' => 'user',
        ];
    }
}


