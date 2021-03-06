ig.module('game.feature.world-map-overhaul')
  .requires(
    'game.feature.menu.map-model',
    'game.feature.menu.gui.map.map-worldmap',
    'impact.base.image',
  )
  .defines(() => {
    const CHANGED_BUTTON_POSITIONS = {
      arid: { x: 454, y: 213 },
      'autumn-area': { x: 259, y: 158 },
      'autumn-fall': { x: 329, y: 163 },
      'bergen-trails': { x: 189, y: 168 },
      'cargo-ship': { x: 370, y: 260 },
      'cold-dng': { x: 204, y: 68 },
      forest: { x: 415, y: 153 },
      jungle: { x: 279, y: 113 },
      'jungle-city': { x: 313, y: 128 },
      'rhombus-sqr': { x: 275, y: 248 },
      'rookie-harbor': { x: 273, y: 198 },
    };

    const AREAS_WITH_REVEAL = [
      'arid',
      'autumn-area',
      'autumn-fall',
      'bergen-trails',
      'forest',
      'heat-area',
      'jungle',
      'rookie-harbor',
    ];

    const BUTTON_SPRITE = {
      srcX: 0,
      srcY: 0,
      width: 10,
      height: 10,
      posX: 3,
      posY: 3,
    };

    const CROSSHAIR_SPRITE = {
      srcX: 14,
      srcY: 39,
      width: 25,
      height: 25,
      posX: -5,
      posY: -4,
    };

    const BUTTON_HIGHLIGHT_SPRITE = {
      srcX: 39,
      srcY: 39,
      width: CROSSHAIR_SPRITE.width,
      height: CROSSHAIR_SPRITE.height,
      posX: CROSSHAIR_SPRITE.posX,
      posY: CROSSHAIR_SPRITE.posY,
    };

    ccmod.resources.jsonPatches.add('data/database.json', (data) => {
      for (let [id, pos] of Object.entries(CHANGED_BUTTON_POSITIONS)) {
        data.areas[id].position = pos;
      }
    });

    sc.AreaButton.inject({
      patchedGfx: new ig.Image(
        'mod://world-map-overhaul/media/area-buttons.png',
      ),

      updateDrawables(renderer) {
        if (this.focus) {
          renderer
            .addGfx(
              this.patchedGfx,
              BUTTON_HIGHLIGHT_SPRITE.posX,
              BUTTON_HIGHLIGHT_SPRITE.posY,
              BUTTON_HIGHLIGHT_SPRITE.srcX,
              BUTTON_HIGHLIGHT_SPRITE.srcY,
              BUTTON_HIGHLIGHT_SPRITE.width,
              BUTTON_HIGHLIGHT_SPRITE.height,
            )
            .setCompositionMode('lighter');
          renderer.addGfx(
            this.patchedGfx,
            CROSSHAIR_SPRITE.posX,
            CROSSHAIR_SPRITE.posY,
            CROSSHAIR_SPRITE.srcX,
            CROSSHAIR_SPRITE.srcY,
            CROSSHAIR_SPRITE.width,
            CROSSHAIR_SPRITE.height,
          );
        }

        renderer.addGfx(
          this.patchedGfx,
          BUTTON_SPRITE.posX,
          BUTTON_SPRITE.posY,
          BUTTON_SPRITE.srcX +
            sc.AREA_TYPE[this.area.areaType] * BUTTON_SPRITE.width,
          BUTTON_SPRITE.srcY + (this.activeArea ? 1 : 0) * BUTTON_SPRITE.height,
          BUTTON_SPRITE.width,
          BUTTON_SPRITE.height,
        );

        if (this.activeArea) {
          // hardcoded coordinates from game.compiled.js
          renderer.addGfx(this.gfx, 1, 2, 304, 440, 3, 3);
          renderer.addGfx(this.gfx, -11, -8, 280, 424, 16, 11);
        }
      },
    });

    sc.MapWorldMap.inject({
      _seaGfx: new ig.Image(`mod://world-map-overhaul/media/sea.png`),
      _areasGfx: [],
      _areaVisitStatuses: null,

      _addAreas(...args) {
        this._areaVisitStatuses = new Map();
        for (let id of AREAS_WITH_REVEAL) {
          this._areaVisitStatuses.set(id, false);
        }

        let result = this.parent(...args);

        for (let [id, visited] of this._areaVisitStatuses) {
          let overlayType = visited ? 'colored' : 'default';
          this._areasGfx.push(
            new ig.Image(
              `mod://world-map-overhaul/media/overlays/${overlayType}/${id}.png`,
            ),
          );
        }
        this._areaVisitStatuses = null;

        return result;
      },

      _addAreaButton(id, area, ...args) {
        let btn = this.parent(id, area, ...args);
        if (this._areaVisitStatuses.has(id)) {
          this._areaVisitStatuses.set(id, true);
        }
        return btn;
      },

      updateDrawables(renderer) {
        let size = this.hook.size;
        renderer.addColor('black', 0, 0, size.x, size.y);
        renderer.addGfx(this._seaGfx, 0, 0, 0, 0, size.x, size.y);

        let gfxs = this._areasGfx;
        for (let i = 0, len = gfxs.length; i < len; i++) {
          renderer.addGfx(gfxs[i], 0, 0, 0, 0, size.x, size.y);
        }
      },
    });
  });
