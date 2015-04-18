/**
 * jQuery OctoModal 1.0.1-beta3
 *
 * Copyright 2015 Anton Drobot me@antondrobot.ru.
 *
 * https://github.com/anton-drobot/octomodal
 *
 * Licensed under MIT.
 *
 * Options:
 *  action: open | close | setContent | setOptions
 *  type: page | gallery
 *  effect: fade-in-scale | ...
 *  showCloseButton: true | false
 *  closeOnOverlay: true | false
 *  removeTimeOut: 400 | ...
 *  width: auto | small | medium | large | xLarge ...
 *  widthBreakPoints: {...}
 *  classes: '' | ,,,
 *  content: ...
 *
 *  Changelog:
 * - 1.0.1-beta1:
 *   - First version
 * - 1.0.1-beta2
 *   - Added wrapper div
 *   - Added CSS
 * - 1.0.1-beta3
 *   - New options: classes
 *   - Fixed bug with modal position
 * - 1.0.1-beta4
 *   - New options: width, widthBreakPoints
 *   - Fixed bug with modal position
 */

;(function ($, window, document, undefined) {
    'use strict';

    var defaults = {
        action: 'open',
        type: 'page',
        effect: 'fade-in-scale',
        showCloseButton: true,
        closeOnOverlay: true,
        removeTimeOut: 400,
        width: 'auto',
        widthBreakPoints: {
            small: '400px',
            medium: '720px',
            large: '960px',
            xLarge: '1140px'
        },
        classes: '',
        content: '',
        templates: {
            main: '<div class="octomodal octomodal--open ${effect}${classes}"><div class="octomodal__wrapper"><div class="octomodal__container"${width}><div class="octomodal__content">${content}</div>${closeButton}</div></div></div>',
            closeButton: '<div class="octomodal__close-button"></div>'
        }
    };

    function OctoModal(options) {
        this.options = $.extend({}, defaults, options);

        this.data = {
            status: 'close',
            closeSelectors: []
        };

        this.init();
        this.doAction();
    }

    OctoModal.prototype.init = function () {
        if (this.options.showCloseButton) {
            this.data.closeSelectors.push('.octomodal__close-button');
        }

        if (this.options.closeOnOverlay) {
            this.data.closeSelectors.push('.octomodal__wrapper');
        }
    };

    OctoModal.prototype.setOptions = function (options) {
        if (typeof options.action === undefined) {
            options.action = 'setOptions';
        }

        this.options = $.extend({}, this.options, options);

        this.init();
        this.doAction();
    };

    OctoModal.prototype.doAction = function () {
        if (this.options.action === 'open') {
            this.openAction();
        }

        if (this.options.action === 'setContent') {
            this.setContentAction();
        }

        if (this.options.action === 'close') {
            this.closeAction();
        }
    };

    OctoModal.prototype.openAction = function () {
        if (this.data.status === 'close') {
            var content = this.getTemplate(this.options.content);
            $(document.body).append(content);
            this.setPosition();
            this.preventBodyScrolling(true);
            this.data.status = 'open';
            this.addEvents();
        } else {
            this.options.action = 'setContent';
            this.doAction();
        }
    };

    OctoModal.prototype.setContentAction = function () {
        if (this.data.status === 'open') {
            $('.octomodal').find('.octomodal__content').html(this.options.content);
            this.setPosition();
        } else {
            this.options.action = 'open';
            this.doAction();
        }
    };

    OctoModal.prototype.closeAction = function () {
        if (this.data.status === 'open') {
            $('.octomodal').removeClass('octomodal--open').addClass('octomodal--close');
            window.setTimeout(function () {
                $('.octomodal').remove();
            }, this.options.removeTimeOut);
            this.preventBodyScrolling(false);
            this.data.status = 'close';
            this.setToDefaults();
            this.removeEvents();
        }
    };

    OctoModal.prototype.setPosition = function () {
        var container = $('.octomodal').find('.octomodal__container');
        var containerHeight = container.outerHeight();
        var windowHeight = $(window).height();
        var bodyScrollTop = $(document).scrollTop();
        var styles = {
            marginTop: 30,
            marginBottom: 30
        };

        if (windowHeight > (containerHeight + styles.marginTop + styles.marginBottom)) {
            styles.marginTop = Math.floor((windowHeight - containerHeight) / 2);
            styles.marginBottom = 0;
        }

        styles.marginTop += bodyScrollTop;

        container.css(styles);
    };

    OctoModal.prototype.getTemplate = function (content) {
        var template = this.options.templates.main;
        var closeButtonTemplate = '';
        var effect = '';
        var classes = '';
        var width = '';

        if (this.options.showCloseButton) {
            closeButtonTemplate = this.options.templates.closeButton;
        }

        if (this.options.effect && this.options.effect.length > 0) {
            effect = ' octomodal--' + this.options.effect;
        }

        if (this.options.classes && this.options.classes.length > 0) {
            classes = ' ' + this.options.classes;
        }

        if (this.options.width !== 'auto' && this.options.width.length > 0) {
            if (typeof this.options.widthBreakPoints[this.options.width] !== 'undefined') {
                width = ' style="width: ' + this.options.widthBreakPoints[this.options.width] + ';"';
            } else {
                width = ' style="width: ' + this.options.width + ';"';
            }
        }

        template = template.replace(/\$\{effect}/, effect);
        template = template.replace(/\$\{closeButton}/, closeButtonTemplate);
        template = template.replace(/\$\{classes}/, classes);
        template = template.replace(/\$\{width}/, width);

        return template.replace(/\$\{content}/, content);
    };

    OctoModal.prototype.addEvents = function () {
        var self = this;
        var closed = false;

        if (this.data.closeSelectors.length > 0) {
            $(document.body).on('click.OctoModal', '.octomodal', function (event) {
                self.data.closeSelectors.forEach(function(element, index, array) {
                    if ($(event.target).is(element) && !closed) {
                        self.closeAction();
                        closed = true;
                    }
                });
            });
        }

        $(window).on('resize.OctoModal', function (event) {
            self.setPosition();
        });
    };

    OctoModal.prototype.removeEvents = function () {
        $(document.body).off('.OctoModal');
    };

    OctoModal.prototype.setToDefaults = function () {
        this.options = defaults;
    };

    OctoModal.prototype.preventBodyScrolling = function (prevent) {
        if (prevent) {
            $(document.body).addClass('octomodal-fix');
        }

        if (!prevent) {
            $(document.body).removeClass('octomodal-fix');
        }
    };

    $.octoModal = function (options) {
        var data = $(document.body).data('OctoModal');

        if (!data && (typeof options === 'object' || options === undefined)) {
            return $(document.body).data('OctoModal', new OctoModal(options));
        } else if (data && (typeof options === 'object' || options === undefined)) {
            return data.setOptions(options)
        }
    }
})(jQuery, window, document);