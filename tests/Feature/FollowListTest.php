<?php

namespace Tests\Feature;

use App\Models\FavList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Tests para la funcionalidad de seguir y dar like a listas.
 *
 * Cubre los flujos críticos del sistema de listas seguidas/liked a nivel de API REST.
 */
class FollowListTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────

    /** Crea un usuario con país (requerido por la migración). */
    private function crearUsuario(array $attrs = []): User
    {
        $country = \App\Models\Country::first() ?? \App\Models\Country::factory()->create();

        return User::factory()->create(array_merge([
            'country_id'         => $country->id,
            'profile_visibility' => 'public',
        ], $attrs));
    }

    /** Crea una lista pública asociada a un usuario. */
    private function crearLista(User $user, array $attrs = []): FavList
    {
        return FavList::create(array_merge([
            'user_id'    => $user->id,
            'name'       => 'Lista de prueba',
            'visibility' => 'public',
        ], $attrs));
    }

    // ─────────────────────────────────────────────
    //  Test 1: Seguir una lista ajena a nivel de Modelo
    // ─────────────────────────────────────────────

    public function test_un_usuario_puede_seguir_una_lista_ajena_modelo(): void
    {
        $seguidor = $this->crearUsuario();
        $creador  = $this->crearUsuario();
        $lista    = $this->crearLista($creador);

        $this->assertFalse($seguidor->isFollowingList($lista));

        $seguidor->followList($lista);

        $this->assertTrue($seguidor->fresh()->isFollowingList($lista));
        $this->assertDatabaseHas('list_likes', [
            'user_id' => $seguidor->id,
            'list_id' => $lista->id,
        ]);
    }

    // ─────────────────────────────────────────────
    //  Test 2: Dejar de seguir a nivel de Modelo
    // ─────────────────────────────────────────────

    public function test_un_usuario_puede_dejar_de_seguir_una_lista_modelo(): void
    {
        $seguidor = $this->crearUsuario();
        $creador  = $this->crearUsuario();
        $lista    = $this->crearLista($creador);

        $seguidor->followList($lista);
        $this->assertTrue($seguidor->fresh()->isFollowingList($lista));

        $seguidor->unfollowList($lista);

        $this->assertFalse($seguidor->fresh()->isFollowingList($lista));
        $this->assertDatabaseMissing('list_likes', [
            'user_id' => $seguidor->id,
            'list_id' => $lista->id,
        ]);
    }

    // ─────────────────────────────────────────────
    //  Test 3: Seguir lista vía API (endpoint /follow)
    // ─────────────────────────────────────────────

    public function test_un_usuario_puede_seguir_una_lista_ajena_via_api(): void
    {
        $seguidor = $this->crearUsuario();
        $creador  = $this->crearUsuario();
        $lista    = $this->crearLista($creador);

        Sanctum::actingAs($seguidor);

        $response = $this->postJson("/api/lists/{$lista->id}/follow");

        $response->assertStatus(200);
        $response->assertJsonPath('following', true);
        $response->assertJsonPath('likes_count', 1);

        $this->assertTrue($seguidor->fresh()->isFollowingList($lista));
    }

    // ─────────────────────────────────────────────
    //  Test 4: Dejar de seguir lista vía API (endpoint /follow)
    // ─────────────────────────────────────────────

    public function test_un_usuario_puede_dejar_de_seguir_una_lista_via_api(): void
    {
        $seguidor = $this->crearUsuario();
        $creador  = $this->crearUsuario();
        $lista    = $this->crearLista($creador);

        $seguidor->followList($lista);

        Sanctum::actingAs($seguidor);

        $response = $this->postJson("/api/lists/{$lista->id}/follow");

        $response->assertStatus(200);
        $response->assertJsonPath('following', false);
        $response->assertJsonPath('likes_count', 0);

        $this->assertFalse($seguidor->fresh()->isFollowingList($lista));
    }

    // ─────────────────────────────────────────────
    //  Test 5: Dashboard de listas
    // ─────────────────────────────────────────────

    public function test_el_dashboard_retorna_listas_del_usuario(): void
    {
        $usuario = $this->crearUsuario();
        $this->crearLista($usuario, ['name' => 'Mi Lista Propia']);

        Sanctum::actingAs($usuario);

        $response = $this->getJson("/api/dashboard/lists");

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Mi Lista Propia']);
    }

    // ─────────────────────────────────────────────
    //  Test 6: Perfil público muestra listas seguidas
    // ─────────────────────────────────────────────

    public function test_el_perfil_publico_muestra_listas_cuando_son_publicas(): void
    {
        $propietario = $this->crearUsuario(['profile_visibility' => 'public']);
        $this->crearLista($propietario, [
            'name'       => 'Lista Pública',
            'visibility' => 'public',
        ]);

        $visitante = $this->crearUsuario();
        Sanctum::actingAs($visitante);

        $response = $this->getJson("/api/users/{$propietario->id}/lists");

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Lista Pública']);
    }

    // ─────────────────────────────────────────────
    //  Test 7: Perfil privado oculta las listas
    // ─────────────────────────────────────────────

    public function test_el_perfil_privado_oculta_las_listas(): void
    {
        $propietario = $this->crearUsuario(['profile_visibility' => 'private']);
        $this->crearLista($propietario, [
            'name'       => 'Lista en Perfil Privado',
            'visibility' => 'public',
        ]);

        $visitante = $this->crearUsuario();
        Sanctum::actingAs($visitante);

        $response = $this->getJson("/api/users/{$propietario->id}/lists");

        $response->assertStatus(403);
    }
}
