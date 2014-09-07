﻿define(['require', './graphics', './math', '../polyfill', './input', './time', './string', '../utils/string'], function (require) {
    "use strict";

    // Settings
    var settings = {
        heapSize: 16 * 1024 * 1024
    };

    var Graphics = require('./graphics');
    var Input = require('./input');
    var Time = require('./time');
    var StringUtils = require('../utils/string');

    function Worker(mirror) {
        this.mirror = mirror;

        this.mirror.on('init', this.init.bind(this));
        this.mirror.on('start', this.start.bind(this));
    }

    Worker.prototype = {
        init: function init(code) {
            var Program = new Function('stdlib', 'env', 'heap', code);
            var external = this.createExternal();
            //console.log(code);
            this.program = Program(external.stdlib, external.env, external.heap);
            external.after();
            this.program.init();
        },

        start: function start() {
            var lastStep = 0;
            var f = step.bind(this);
            function step() {
                this.program.next();
                setTimeout(f, 0);
            }
            setTimeout(f, 0);
        },

        createExternal: function createExternal() {
            var stdlib = {
                Math: Math,
                Uint8Array: Uint8Array,
                Int32Array: Int32Array,
                Uint32Array: Uint32Array,
                Float32Array: Float32Array,
                Float64Array: Float64Array
            };

            var env = {};
            env.heapSize = settings.heapSize;
            env.panic = this.panic.bind(this);

            var heap = new ArrayBuffer(env.heapSize);
            var strutil = new StringUtils(heap);

            var graphics = new Graphics(this.mirror, strutil);
            graphics.extendEnv(env);

            var math = new (require('./math'))(this.mirror);
            math.extendEnv(env);

            var input = new Input(this.mirror);
            input.extendEnv(env);

            var time = new Time(this.mirror, strutil);
            time.extendEnv(env);

            var string = new (require('./string'))(this.mirror, strutil);
            string.extendEnv(env);

            function after() {
                strutil.setProgram(this.program);
                graphics.setProgram(this.program);
                time.setProgram(this.program);
            }

            return {
                stdlib: stdlib,
                env: env,
                heap: heap,
                after: after.bind(this)
            };
        },

        panic: function panic() {
            this.mirror.send('panic');
        }
    };

    return Worker;
});