<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable;


    protected $fillable = [
        'name',
        'email',
        'password',
        'telephone',
        'date_of_birth',
        'gender',
        'country_id',
        'avatar',
        'profile_visibility',
        'bio',
        'location',
        'website',
        'twitter',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_blocked' => 'boolean',
        ];
    }

    /**
     * Devuelve la URL del avatar del usuario.
     * Si tiene foto de perfil propia la devuelve; en caso contrario genera
     * un avatar automático con ui-avatars usando el nombre real del usuario.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
                return $this->avatar;
            }
            $cleanPath = ltrim($this->avatar, '/');
            if (str_starts_with($cleanPath, 'storage/')) {
                $cleanPath = substr($cleanPath, 8);
            }
            return \Illuminate\Support\Facades\Storage::disk('public')->url($cleanPath);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name ?? 'U')
            . '&background=0E3FA9&color=fff&rounded=false';
    }

    /* Relaciones */

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function lists()
    {
        return $this->hasMany(FavList::class);
    }

    public function books()
    {
        return $this->hasMany(BookUser::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function followers()
    {
        return $this->hasMany(Follow::class , 'followed_id');
    }

    public function following()
    {
        return $this->hasMany(Follow::class , 'follower_id');
    }

    /**
     * Check if this user is friends with another user (mutual follow).
     */
    public function isFriend(User $user): bool
    {
        return $this->following()->where('followed_id', $user->id)->exists() &&
            $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * Chequea que este usuario es seguido por otros usuarios.
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('followed_id', $user->id)->exists();
    }

    /**
     * Autores seguidos por este usuario.
     */
    public function followedAuthors()
    {
        return $this->belongsToMany(Author::class , 'author_followers', 'user_id', 'author_id')->withTimestamps();
    }

    /**
     * Listas seguidas (con like) por este usuario.
     */
    public function likedLists()
    {
        return $this->belongsToMany(FavList::class , 'list_likes', 'user_id', 'list_id')->withTimestamps();
    }

    /**
     * Check if this user is following an author.
     */
    public function isFollowingAuthor(Author $author): bool
    {
        return $this->followedAuthors()->where('author_id', $author->id)->exists();
    }

    /**
     * Check if this user is following (liked) a list.
     */
    public function isFollowingList(FavList $list): bool
    {
        return $this->likedLists()->where('list_id', $list->id)->exists();
    }

    /**
     * Seguir usaurio.
     */
    public function follow(User $user)
    {
        return $this->following()->firstOrCreate(['followed_id' => $user->id]);
    }

    /**
     * Unfollow a usuario.
     */
    public function unfollow(User $user)
    {
        return $this->following()->where('followed_id', $user->id)->delete();
    }

    /**
     * Seguir a un autor.
     */
    public function followAuthor(Author $author)
    {
        return $this->followedAuthors()->attach($author->id);
    }

    /**
     * dejar de seguir a un autor.
     */
    public function unfollowAuthor(Author $author)
    {
        return $this->followedAuthors()->detach($author->id);
    }

    /**
     * Seguir una lista (dar like).
     */
    public function followList(FavList $list)
    {
        return $this->likedLists()->attach($list->id);
    }

    /**
     * Dejar de seguir una lista (quitar like).
     */
    public function unfollowList(FavList $list)
    {
        return $this->likedLists()->detach($list->id);
    }
}