/**
 * jQuery OctoModal 1.0.1-beta8
 *
 * Copyright 2015 Anton Drobot me@antondrobot.ru.
 *
 * https://github.com/anton-drobot/octomodal
 *
 * Licensed under MIT.
 *
 * Events:
 *   initialized.OctoModal
 *   opened.OctoModal
 *   contentChanged.OctoModal
 *   closed.OctoModal
 *   positionChanged.OctoModal
 *
 * Change Log:
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
 * - 1.0.1-beta5
 *   - Added triggers
 * - 1.0.1-beta6
 *   - New options: galleryList
 *   - Remove options: type
 * - 1.0.1-beta7
 *   - The whole script has been rewritten
 * - 1.0.1-beta8
 *   - Fix gallery bugs
 */

;(function ($, window, document, undefined) {
    'use strict';

    var defaults = {
        action: 'open',
        gallerySelector: '',
        galleryPosition: 0,
        effect: 'fade-in-scale',
        showCloseButton: true,
        closeOnOverlay: true,
        removeTimeOut: 400,
        width: 'auto',
        classes: [],
        content: '',
        templates: {
            main: '<div class="octomodal octomodal--open ${classes}"><div class="octomodal__wrapper"><div class="octomodal__container" ${styles}><div class="octomodal__content">${content}</div>${galleryControls}${closeButton}</div></div></div>',
            closeButton: '<div class="octomodal__close-button"></div>',
            gallery: {
                image: '<img src="${image}" class="octomodal__gallery-image js-octomodal__gallery-right" alt="">',
                controls: '<div class="octomodal__controls"><div class="octomodal__controls-item octomodal__controls-item--left js-octomodal__gallery-left"></div><div class="octomodal__controls-item octomodal__controls-item--right js-octomodal__gallery-right"></div></div>'
            }
        }
    };

    var data = {
        status: 'close',
        closeSelectors: [],
        gallery: false,
        galleryList: [],
        galleryPosition: 0
    };

    function OctoModal(options) {
        $(document).trigger('initialized.OctoModal');

        this.run(options);
    }

    OctoModal.prototype.run = function (options) {
        this.setOptions(options);
        this.setData();
        this.setCloseSelectors();
        this.setActions();

        if (this.data.gallery) {
            this.getGalleryList();
            this.setGalleryEvents();
        } else {
            this.doAction();
        }
    };

    OctoModal.prototype.setOptions = function (options) {
        this.options = $.extend({}, defaults, options);
    };

    OctoModal.prototype.setData = function () {
        this.data = data;
        this.data.gallery = this.options.gallerySelector.length > 0;
    };

    OctoModal.prototype.setCloseSelectors = function () {
        if (this.options.showCloseButton) {
            this.data.closeSelectors.push('.octomodal__close-button');
        }

        if (this.options.closeOnOverlay) {
            this.data.closeSelectors.push('.octomodal__wrapper');
        }
    };

    OctoModal.prototype.setActions = function () {
        var _this = this;

        this.actions = {
            open: function () {
                if (_this.data.status === 'close') {

                    var template = _this.getTemplate(_this.options.content);

                    $(document.body).append(template);

                    _this.setPosition();
                    _this.preventBodyScrolling(true);
                    _this.data.status = 'open';
                    _this.addEvents();

                    $(document).trigger('opened.OctoModal');

                } else {

                    _this.options.action = 'setContent';
                    _this.doAction();

                }
            },
            setContent: function () {
                if (_this.data.status === 'open') {

                    $('.octomodal').find('.octomodal__content').html(_this.options.content);
                    _this.setPosition();

                    $(document).trigger('contentChanged.OctoModal');

                } else {

                    _this.options.action = 'open';
                    _this.doAction();

                }
            },
            close: function () {
                if (_this.data.status === 'open') {

                    $('.octomodal').removeClass('octomodal--open').addClass('octomodal--close');

                    window.setTimeout(function () {
                        $('.octomodal').remove();
                    }, _this.options.removeTimeOut);

                    _this.preventBodyScrolling(false);
                    _this.data.status = 'close';
                    _this.removeEvents();

                    $(document).trigger('closed.OctoModal');

                }
            }
        }
    };

    OctoModal.prototype.doAction = function () {
        if (this.actions[this.options.action] !== undefined) {
            this.actions[this.options.action]();
        }
    };

    OctoModal.prototype.getTemplate = function (content) {
        var template = this.options.templates.main;
        var closeButtonTemplate = '';
        var galleryControlsTemplate = '';
        var classes = [];
        var styles = [];

        if (this.options.showCloseButton) {
            closeButtonTemplate = this.options.templates.closeButton;
        }

        if (this.data.gallery) {
            classes.push('octomodal--gallery');
            galleryControlsTemplate = this.options.templates.gallery.controls;
        }

        if (this.options.effect.length > 0) {
            classes.push('octomodal--' + this.options.effect);
        }

        if (this.options.classes && this.options.classes.length > 0) {
            classes.push(this.options.classes);
        }

        if (this.options.width !== 'auto' && this.options.width.length > 0) {
            styles.push('width: ' + this.options.width);
        }

        template = template.replace(/\$\{closeButton}/, closeButtonTemplate);
        template = template.replace(/\$\{galleryControls}/, galleryControlsTemplate);
        template = template.replace(/\$\{classes}/, classes.join(' '));
        template = template.replace(/\$\{styles}/, 'style="' + styles.join('; ') + '"');

        template = template.replace(/\$\{content}/, content);

        return template;
    };

    OctoModal.prototype.getPosition = function (element) {
        var container = element || $('.octomodal').find('.octomodal__container');
        var containerHeight = container.outerHeight();
        var windowHeight = $(window).height();

        var styles = {
            marginTop: 30,
            marginBottom: 30
        };

        if (windowHeight > (containerHeight + styles.marginTop + styles.marginBottom)) {
            styles.marginTop = Math.floor((windowHeight - containerHeight) / 2);
            styles.marginBottom = 0;
        }

        return styles;
    };

    OctoModal.prototype.setPosition = function () {
        var container = $('.octomodal').find('.octomodal__container');

        container.css(this.getPosition(container));

        $(document).trigger('positionChanged.OctoModal');
    };

    OctoModal.prototype.preventBodyScrolling = function (prevent) {
        if (prevent) {
            $(document.body).addClass('octomodal-fix');
        }

        if (!prevent) {
            $(document.body).removeClass('octomodal-fix');
        }
    };

    OctoModal.prototype.addEvents = function () {
        var _this = this;
        var closed = false;

        if (this.data.closeSelectors.length > 0) {
            $(document.body).on('click.OctoModal', '.octomodal', function (event) {
                _this.data.closeSelectors.forEach(function(element, index, array) {
                    if ($(event.target).is(element) && !closed) {
                        _this.actions.close();
                        closed = true;
                    }
                });
            });
        }

        if (this.data.gallery) {
            $(document.body).on('click.OctoModal', '.js-octomodal__gallery-left', function (event) {
                if (_this.data.galleryPosition === 0) {
                    _this.data.galleryPosition = _this.data.galleryList.length - 1;
                } else {
                    _this.data.galleryPosition -= 1;
                }

                _this.changeGalleryContent(_this.data.galleryPosition);
            });

            $(document.body).on('click.OctoModal', '.js-octomodal__gallery-right', function (event) {
                if (_this.data.galleryPosition === (_this.data.galleryList.length - 1)) {
                    _this.data.galleryPosition = 0;
                } else {
                    _this.data.galleryPosition += 1;
                }

                _this.changeGalleryContent(_this.data.galleryPosition);
            });
        }

        $(window).on('resize.OctoModal', function (event) {
            _this.setPosition();
        });
    };

    OctoModal.prototype.removeEvents = function () {
        $(document.body).off('.OctoModal');
    };

    OctoModal.prototype.getGalleryList = function () {
        var _this = this;

        $(this.options.gallerySelector).each(function (index, element) {
            _this.data.galleryList.push($(this).attr('href'));
        });
    };

    OctoModal.prototype.setGalleryEvents = function () {
        this.data.galleryPosition = this.options.galleryPosition;
        this.showGallery();
    };

    OctoModal.prototype.loadImage = function () {
        var _this = this;

        $('.octomodal__gallery-image').on('load', function (event) {
            _this.setPosition();
        });
    };

    OctoModal.prototype.showGallery = function () {
        this.options.content = this.getGalleryTemplate(this.data.galleryList[this.data.galleryPosition]);
        this.actions.open();
        this.loadImage();
    };

    OctoModal.prototype.getGalleryTemplate = function (image) {
        var template = this.options.templates.gallery.image;
        template = template.replace(/\$\{image}/, image);

        return template;
    };

    OctoModal.prototype.changeGalleryContent = function (galleryPosition) {
        this.options.content = this.getGalleryTemplate(this.data.galleryList[galleryPosition]);
        this.actions.setContent();
        this.loadImage();
    };

    $.octoModal = function (options) {
        var data = $(document.body).data('OctoModal');

        if (!data && (typeof options === 'object' || options === undefined)) {
            return $(document.body).data('OctoModal', new OctoModal(options));
        } else if (data && (typeof options === 'object' || options === undefined)) {
            return data.run(options);
        }
    };
})(jQuery, window, document);
