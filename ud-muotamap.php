<?php

/**
 * Plugin Name:       UD Block: Muotamap
 * Description:       Block zum Darstellen von Karten mit OpenStreetMap (Leaflet) – als Single-Map mit mehreren Standorten oder als Collection-Map, die alle Standorte aus mehreren Karten bündelt.
 * Version:           1.2.0
 * Author:            ulrich.digital gmbh
 * Author URI:        https://ulrich.digital/
 * Requires at least: 6.7.1
 * Requires PHP:      8.0
 */

if (! defined('ABSPATH')) exit;

/**
 * Pfad/URL Helper
 */
define('MUOTAMAP_DIR', plugin_dir_path(__FILE__));
define('MUOTAMAP_URL', plugins_url('', __FILE__));

/**
 * Assets nur REGISTRIEREN (noch nicht enqueuen) → init
 */
add_action('init', function () {
    // Leaflet
    wp_register_script(
        'leaflet-js',
        MUOTAMAP_URL . '/assets/leaflet.js',
        [],
        filemtime(MUOTAMAP_DIR . 'assets/leaflet.js'),
        true
    );

    // Routing (benötigt Leaflet)
    wp_register_script(
        'leaflet-routing-machine',
        MUOTAMAP_URL . '/assets/leaflet-routing-machine.min.js',
        ['leaflet-js'],
        filemtime(MUOTAMAP_DIR . 'assets/leaflet-routing-machine.min.js'),
        true
    );

    // Single Map – Edit & View
    wp_register_script(
        'muotamap-edit-single',
        MUOTAMAP_URL . '/build/single-map/edit.js',
        ['leaflet-js', 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor'],
        filemtime(MUOTAMAP_DIR . 'build/single-map/edit.js'),
        true
    );
    wp_register_script(
        'muotamap-view-single',
        MUOTAMAP_URL . '/build/single-map/view.js',
        ['leaflet-js', 'leaflet-routing-machine', 'wp-api-fetch'],
        filemtime(MUOTAMAP_DIR . 'build/single-map/view.js'),
        true
    );

    // Optional: Styles, nur registrieren wenn vorhanden
    if (file_exists(MUOTAMAP_DIR . 'build/single-map/editor.css')) {
        wp_register_style(
            'muotamap-single-map-editor-style',
            MUOTAMAP_URL . '/build/single-map/editor.css',
            [],
            filemtime(MUOTAMAP_DIR . 'build/single-map/editor.css')
        );
    }
    if (file_exists(MUOTAMAP_DIR . 'build/single-map/style.css')) {
        wp_register_style(
            'muotamap-single-map-style',
            MUOTAMAP_URL . '/build/single-map/style.css',
            [],
            filemtime(MUOTAMAP_DIR . 'build/single-map/style.css')
        );
    }

    // Collection Map – Edit & View
    wp_register_script(
        'muotamap-edit-collection',
        MUOTAMAP_URL . '/build/collection-map/edit.js',
        ['leaflet-js', 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-block-editor'],
        filemtime(MUOTAMAP_DIR . 'build/collection-map/edit.js'),
        true
    );
    wp_register_script(
        'muotamap-view-collection',
        MUOTAMAP_URL . '/build/collection-map/view.js',
        ['leaflet-js', 'leaflet-routing-machine', 'wp-api-fetch'],
        filemtime(MUOTAMAP_DIR . 'build/collection-map/view.js'),
        true
    );

    if (file_exists(MUOTAMAP_DIR . 'build/collection-map/editor.css')) {
        wp_register_style(
            'muotamap-collection-map-editor-style',
            MUOTAMAP_URL . '/build/collection-map/editor.css',
            [],
            filemtime(MUOTAMAP_DIR . 'build/collection-map/editor.css')
        );
    }
    if (file_exists(MUOTAMAP_DIR . 'build/collection-map/style.css')) {
        wp_register_style(
            'muotamap-collection-map-style',
            MUOTAMAP_URL . '/build/collection-map/style.css',
            [],
            filemtime(MUOTAMAP_DIR . 'build/collection-map/style.css')
        );
    }

    // Blöcke registrieren (Handles referenzieren die oben registrierten Assets)
    register_block_type(MUOTAMAP_DIR . '/build/single-map', [
        'editor_script' => 'muotamap-edit-single',
        'editor_style'  => wp_style_is('muotamap-single-map-editor-style', 'registered') ? 'muotamap-single-map-editor-style' : null,
        'script'        => 'muotamap-view-single',
        'style'         => wp_style_is('muotamap-single-map-style', 'registered') ? 'muotamap-single-map-style' : null,
    ]);

    register_block_type(MUOTAMAP_DIR . '/build/collection-map', [
        'editor_script' => 'muotamap-edit-collection',
        'editor_style'  => wp_style_is('muotamap-collection-map-editor-style', 'registered') ? 'muotamap-collection-map-editor-style' : null,
        'script'        => 'muotamap-view-collection',
        'style'         => wp_style_is('muotamap-collection-map-style', 'registered') ? 'muotamap-collection-map-style' : null,
    ]);
});

/**
 * Editor: Leaflet + Edit-Scripte laden
 */
add_action('enqueue_block_editor_assets', function () {
    // Leaflet Basis
    wp_enqueue_script('leaflet-js');

    // Edit-Scripte/Styles (global im Editor ok)
    if (wp_script_is('muotamap-edit-single', 'registered')) {
        wp_enqueue_script('muotamap-edit-single');
    }
    if (wp_script_is('muotamap-edit-collection', 'registered')) {
        wp_enqueue_script('muotamap-edit-collection');
    }
    if (wp_style_is('muotamap-single-map-editor-style', 'registered')) {
        wp_enqueue_style('muotamap-single-map-editor-style');
    }
    if (wp_style_is('muotamap-collection-map-editor-style', 'registered')) {
        wp_enqueue_style('muotamap-collection-map-editor-style');
    }
});

/**
 * Frontend: Nur laden, wenn Blöcke vorhanden sind
 */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) return;

    $has_single     = has_block('muotamap/single-map');
    $has_collection = has_block('muotamap/collection-map');

    if ($has_single || $has_collection) {
        wp_enqueue_script('leaflet-js');
        wp_enqueue_script('leaflet-routing-machine');

        if ($has_single) {
            wp_enqueue_script('muotamap-view-single');
            if (wp_style_is('muotamap-single-map-style', 'registered')) {
                wp_enqueue_style('muotamap-single-map-style');
            }
        }
        if ($has_collection) {
            wp_enqueue_script('muotamap-view-collection');
            if (wp_style_is('muotamap-collection-map-style', 'registered')) {
                wp_enqueue_style('muotamap-collection-map-style');
            }
        }
    }
}, 5);

/**
 * Block-Kategorie
 */
add_filter('block_categories_all', function ($cats, $ctx) {
    if (! empty($ctx->post)) {
        array_unshift($cats, ['slug' => 'muotamaps', 'title' => 'Muota-Maps', 'icon' => null]);
    }
    return $cats;
}, 10, 2);

/**
 * REST: /wp-json/custom/v1/all-pages-markers
 */
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/all-pages-markers', [
        'methods'  => 'GET',
        'callback' => 'muotamap_get_all_markers_from_pages',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Marker sammeln
 */
function muotamap_get_all_markers_from_pages() {
    $q = new WP_Query([
        'post_type'      => ['post', 'page', 'projekt'],
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ]);
    $all = [];
    while ($q->have_posts()) {
        $q->the_post();
        $blocks   = parse_blocks(get_the_content());
        $perma    = get_the_permalink();
        $title    = get_the_title();
        $all      = array_merge($all, muotamap_find_markers_in_blocks($blocks, $perma, $title));
    }
    wp_reset_postdata();
    return $all;
}
function muotamap_find_markers_in_blocks(array $blocks, $permalink, $pagetitle) {
    $out = [];
    foreach ($blocks as $b) {
        if (empty($b['blockName'])) continue;

        if ($b['blockName'] === 'muotamap/single-map' && !empty($b['attrs']['markers'])) {
            foreach ($b['attrs']['markers'] as $m) {
                $out[] = [
                    'latitude'        => $m['latitude']  ?? null,
                    'longitude'       => $m['longitude'] ?? null,
                    'title'           => $m['title']     ?? '',
                    'text'            => $m['text']      ?? '',
                    'image'           => $m['image']     ?? '',
                    'linkedContent'   => $m['linkedContent'] ?? '',
                    'permalinkProjekt' => $permalink,
                    'pageTitle'       => $pagetitle,
                ];
            }
        }
        if (!empty($b['innerBlocks']) && is_array($b['innerBlocks'])) {
            $out = array_merge($out, muotamap_find_markers_in_blocks($b['innerBlocks'], $permalink, $pagetitle));
        }
    }
    return $out;
}
