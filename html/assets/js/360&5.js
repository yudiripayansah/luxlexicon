const $360 = {
    headerHeight: null,
    handleize: function(str) {
        str = str.toLowerCase();
        var toReplace = ['"', "'", "\\", "(", ")", "[", "]"];
        for (var i = 0; i < toReplace.length; ++i) {
            str = str.replace(toReplace[i], "");
        }
        str = str.replace(/\W+/g, "-");
        if (str.charAt(str.length - 1) == "-") {
            str = str.replace(/-+\z/, "");
        }
        if (str.charAt(0) == "-") {
            str = str.replace(/\A-+/, ""); 
        }
        return str
    },
    getHeaderHeight: function() {
        const header = document.getElementById('site-header');
        if(!header) return;
        this.headerHeight = header.offsetHeight;
        
    },
    lazyLoadInstance: new LazyLoad({
        elements_selector: '.lazy',
    }),
    setGlobalContentTopMargin: function() {
        const el = document.querySelector('.global-content-top-margin');
        if(el) {
            if($360.getCookie('hide_ann_bar') == 'true') {
            } else {
                el.style.marginTop = `${this.headerHeight - 1}px`;
            }
        }
    },
    setStickyBelowHeaderPosition: function() {
        const el = document.querySelector('.sticky-below-header');
        if(el) {
            el.style.top = `${this.headerHeight - 1}px`;
        }
    },
    setMobileMenuWrapperPosition: function() {
        /*
            const el = document.querySelector('.mobile-menu-wrapper');
            if(el) {
                el.style.top = `${this.headerHeight - 1}px`;
            }
        */
    },
    setFullHeightPage: function() {
        const el = document.querySelector('.full-height-page');
        if(el) {
            el.style.height = `calc(100vh - ${this.headerHeight}px)`;
        }
    },
    btnLoading: function() {
        return `<span class="btn-loading"></span>`;
    },
    updateQueryString: function(key, value, url) {
        if (!url) url = window.location.href;
  
      let updated = ''
      var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
          hash;
  
      if (re.test(url)) {
          if (typeof value !== 'undefined' && value !== null) {
              updated = url.replace(re, '$1' + key + "=" + value + '$2$3');
          } 
          else {
              hash = url.split('#');
              url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
              if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                  url += '#' + hash[1];
              }
              updated = url;
          }
      }
      else {
          if (typeof value !== 'undefined' && value !== null) {
              var separator = url.indexOf('?') !== -1 ? '&' : '?';
              hash = url.split('#');
              url = hash[0] + separator + key + '=' + value;
              if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                  url += '#' + hash[1];
              }
              updated = url;
          }
          else {
              updated = url;
          }
      }
  
      window.history.replaceState({ path: updated }, '', updated);
    },
    getSearchContent: async function(tpl, q) {
        let surl = `/search?view=${tpl}&q=${q}`;
        try {
            const goFind = await axios.get(surl);
            return goFind;
        } catch (error) {
            alert(error.response.data.message);
        }
    },
    /**
     * args is an object of qty, variantId, properties, button
     * callback: function callback after success
     */
    quickAddToCardVarId: function(var_id, elem = null) {
        if(elem != null) {
            if(!elem.classList.contains('disabled')) {
                $360.addToCart({
                    qty: 1,
                    variantId: var_id
                });
            }
        } else {
            $360.addToCart({
                qty: 1,
                variantId: var_id
            });
        }
    },
    addToCart: async function(args, callback) {
        const qty = args.qty;
        const variantId = args.variantId;
        const properties = args.properties;
        const button = args.button;

        let prevText;
        if(button) {
            prevText = button.innerHTML;
            const btnLoading = '<span class="btn-loading"></span>';
            button.style.height = `${button.offsetHeight}px`;
            button.style.width = `${button.offsetWidth}px`;
            //button.innerHTML = prevText + btnLoading;
            button.innerHTML = btnLoading;
            button.setAttribute('disabled', true);

            const delay_animate = setTimeout(() => {
                button.classList.add('is-loading');

                clearTimeout(delay_animate);
            }, 100);
        }
        
        const data = {quantity: qty, id: variantId};

        if(properties) {
            data.properties = properties;
        }

        try {
            const addToCart = await axios.post('/cart/add.js', data);
            const cart = addToCart.data;
            this.showHeaderCart({update: true});
            if(document.getElementById('cart-content')) {
                this.refreshCartPage()
            }

            if(callback) {
                callback(cart);
            }
        } catch (error) {
            alert(error.response.data.message);
        } finally {
            if(button) {
                const delay_button = setTimeout(() => {
                    button.innerHTML = prevText;
                    button.removeAttribute('disabled');
                    button.style.height = '';
                    button.style.width = '';
                    button.classList.remove('is-loading');

                    clearTimeout(delay_button);
                }, 1000);
            }
        }
    },
    addToCartMultiple: function(args, callback) {
        const products = args.products;
        /*
        products array is object that consist of these
        {
            varId: String. the variant id,
            qty: Numeric. Quantity to be added
            properties: Object. The line item properties Object
        }
        */
        const button = args.button;
        
        let is_update = true;
        if(args.is_update != undefined) {
            is_update = args.is_update;
        }

        const thisObj = this;

        let prevText;
        if(button) {
            prevText = button.innerHTML;
            const btnLoading = '<span class="btn-loading"></span>';
            button.style.height = `${button.offsetHeight}px`;
            button.style.width = `${button.offsetWidth}px`;
            //button.innerHTML = prevText + btnLoading;
            button.innerHTML = btnLoading;

            const delay = setTimeout(() => {
                button.setAttribute('disabled', true);
                button.classList.add('is-loading');

                clearTimeout(delay);
            }, 250);
        }
        
		Shopify.moveAlong = function() {
			if (products.length) {
				const product = products.shift();

                const productData = {
                    id: product.varId,
                    quantity: product.qty 
                };

                if(product.hasOwnProperty('properties')) {
                    productData.properties = product.properties;
                };

                axios.post('/cart/add.js', productData)
                    .then(function(response) {
						Shopify.moveAlong();
                    })
                    .catch(function(error) {
                        console.log(error.response.data.message)
                    });
			} else {
                if(button) {
                    const delay_button = setTimeout(() => {
                        button.innerHTML = prevText;
                        button.removeAttribute('disabled');
                        button.style.height = '';
                        button.style.width = '';
                        button.classList.remove('is-loading');
                        
                        clearTimeout(delay_button);
                    }, 1000);
                }

                //-- check GWP
                if(callback) {
                    callback();
                }

                if(is_update) {
                    thisObj.showHeaderCart({update: true});

                    if(document.getElementById('cart-content')) {
                        thisObj.refreshCartPage()
                    }
                }
			}
		};
		Shopify.moveAlong();
    },
    updateGroupItemQty: async function(args, callback) {
        const thisObj = this;
        const index = args.index;
        const qty = args.qty;
        let groupId = null;
        let removeSameGroup = null;

        if(args.hasOwnProperty('groupId')) {
            groupId = args.groupId;
        }

        try {
            const updateCart = await axios.post('/cart/change.js', {line: index, quantity: qty});
            const cart = updateCart.data;
        } catch (error) {
            alert(error.response.data.message);
        }
    },
    updateItemQty: async function(args, callback) {
        const thisObj = this;
        const index = args.index;
        const qty = args.qty;
        let groupId = null;
        let removeSameGroup = null;

        if(args.hasOwnProperty('groupId')) {
            groupId = args.groupId;
        }
        if(args.hasOwnProperty('removeSameGroup')) {
            removeSameGroup = args.removeSameGroup;

            if(removeSameGroup && document.querySelector('.header-cart-loading') && !document.getElementById('cart-content')) {
                document.querySelector('.header-cart-loading').classList.add('active');
            }
            if(removeSameGroup && document.getElementById('cart-content')) {
                document.querySelector('.page-loading').classList.add('active');
            }
        }

        const doneUpdate = function(callback, cart) {
            if(callback) {
                callback(cart);
            }
        }

        try {
            const updateCart = await axios.post('/cart/change.js', {line: index, quantity: qty});
            const cart = updateCart.data;

            if(qty == 0 && removeSameGroup) {
                const anotherIndex = cart.items.findIndex(item => {
                    if(item.properties.hasOwnProperty('_group_id')) {
                        return item.properties._group_id == groupId
                    } else {
                        return false
                    }
                });

                if(anotherIndex > -1) {
                    thisObj.updateItemQty({
                        index: anotherIndex + 1,
                        qty: 0,
                        groupId: groupId,
                        removeSameGroup: true
                    }, callback)
                } else {
                    doneUpdate(callback, cart);
                }
            } else {
                const anotherIndex = cart.items.findIndex(item => {
                    if(item.properties.hasOwnProperty('_group_id')) {
                        return item.properties._group_id == groupId
                    } else {
                        return false
                    }
                });

                if(anotherIndex > -1) {
                    thisObj.updateGroupItemQty({
                        index: anotherIndex + 1,
                        qty: qty,
                        groupId: groupId
                    }, callback)
                } else {
                    doneUpdate(callback, cart);
                }
            }
        } catch (error) {
            alert(error.response.data.message);
        }
    },
    setActiveCrossSell: function(className, e) {
        e.preventDefault();
        
        const button = e.target.closest('a');
        const parent = button.parentNode;
        const topElem = button.closest('.cross-sell-wrapper');

        if(parent.querySelector('.active') != null) {
            parent.querySelector('.active').classList.add('opacity-4');
            parent.querySelector('.active').classList.remove('active');
        }
        button.classList.remove('opacity-4');
        button.classList.add('active');

        const prevContent = topElem.querySelector('.content-each.active');
        if(prevContent != null) {
            prevContent.classList.remove('active');
            prevContent.classList.add('hide-m');
        }

        const activeContent = topElem.querySelector(`.${className}`);
        if(activeContent != null) {
            activeContent.classList.add('active');
            activeContent.classList.remove('hide-m');
        }
    },
    showHeaderCart: function(args = {}, callback) {
        // callback has cart data object
        const update = args.hasOwnProperty('update') ? args.update : false;
        const thisObj = this;
        
        const showIt = function() {
            document.getElementById('header-cart').classList.add('active');
            document.querySelector('.header-cart-overlay').classList.add('active');
            document.querySelector('body').classList.add('nooverflow');

            const swiper_elem = document.querySelector('.header-cart .ymal-swiper');
            if(swiper_elem != null) {
                new Swiper(swiper_elem, {
                    slidesPerView: 1.5,
                    spaceBetween: 15,
                    breakpoints: {
                        1366: {
                            slidesPerView: 2,
                            freeMode: false,
                        }
                    },
                    loop: false,
                    a11y: false,
                    on: {
                        init: function() {
                            $360.lazyLoadInstance.update();
                        },
                        slideChange: function() {
                            $360.lazyLoadInstance.update();
                        },
                        resize: function() {
                            $360.lazyLoadInstance.update();
                        }
                    }
                });
            }

            if(document.querySelector('.header-cart-loading')) {
                document.querySelector('.header-cart-loading').classList.remove('active');
            }

            thisObj.lazyLoadInstance.update();
        };

        /*
            if(!update && document.getElementById('header-cart').childNodes.length) {
                showIt();
                return;
            }
        */
        
        axios.get('/cart.js')
            .then(function(response) {
                const cart = response.data;
                thisObj.updateHeaderCartCount(cart);
                
                axios.get('/cart?view=json')
                    .then(function(response) {
                        const html = response.data;
                        document.getElementById('header-cart').innerHTML = html;
                        
                        /* load recently viewed */
                        Shopify.Products.showRecentlyViewed({
                            howManyToShow: 3,
                            wrapperId: 'recently-viewed-cart-drawer', 
                            viewTemplate: "grid-cart-drawer",
                            loadOn: "cart",
                            shown: 0,
                            onComplete: function() {
                                thisObj.lazyLoadInstance.update();
                            }
                        });

                        thisObj.adjustCartHeight();
                        showIt();

                        if(callback) {
                            callback(cart)
                        }
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            })
            .catch(function(error) {
                console.log(error)
            });
    },
    addCrossSellToCart: function(e) {
        const this_button = e.target.closest('.icon-add');
        const var_id = this_button.getAttribute('data-variant-id');

        $360.addToCart({
            qty: 1,
            variantId: var_id
        });
    },
    hideHeaderCart: function() {
        document.querySelector('body').classList.remove('nooverflow');

        document.getElementById('header-cart').classList.remove('active');
        document.querySelector('.header-cart-overlay').classList.remove('active');
        document.querySelector('.header-cart-overlay').classList.add('fade-out');
        setTimeout(function() {
            document.querySelector('.header-cart-overlay').classList.remove('fade-out');
        }, 1000);
    },
    updateHeaderCartCount(cart) {
        let count = 0;
        cart.items.forEach(item => {
            if(item.properties) {
                if(!item.properties.hasOwnProperty('_group_id')) {
                    count = count + item.quantity;
                } else {
                    if(item.properties.hasOwnProperty('_group_parent')) {
                        count = count + item.quantity;
                    }
                }
            } else {
                count = count + item.quantity;
            }
        });

        document.querySelector('.header-cart-number .cart-count').textContent = count;
        if(count > 0) {
            document.querySelector('.header-cart-number').classList.remove('hide-m');
            document.querySelector('.header-cart-number').classList.add('flex');
        } else {
            document.querySelector('.header-cart-number').classList.add('hide-m');
            document.querySelector('.header-cart-number').classList.remove('flex');
        }
    },
    adjustCartHeight: function() {
        if(document.querySelector('.header-cart-bottom')) {
            let topHeight = document.querySelector('.header-cart-top').offsetHeight;
            if(document.querySelector('.header-cart-middle .free-cg-info')) {
                topHeight = topHeight + document.querySelector('.header-cart-middle .free-cg-info').offsetHeight + 2;
            }

            const bottomHeight = document.querySelector('.header-cart-bottom').offsetHeight;
            let crossSellHeight = 0;
            if(document.querySelector('.header-cart .cross-sell') && window.innerWidth < 768) {
                crossSellHeight = document.querySelector('.header-cart .cross-sell').offsetHeight;
            }
            const height = `${(window.innerHeight-(topHeight+bottomHeight))}px`;
            document.querySelector('.cart-items-wrapper').style.height = height;
        }
    },
    triggerBIS: function(e) {
        const id = e.target.closest('.atc-button').getAttribute('data-variant');
        const bis_button = document.querySelector('.BIS_trigger');
        bis_button.setAttribute('data-variant-id',id);
        bis_button.click();
    },
    triggerBackInStockInit(){
        console.log("triggerBackInStockInit");
        BIS.popup.ready.then(function() {
            if (BIS.popup.variants.length < 1) {
                return;
            }

            var button = document.createElement('button');
            button.setAttribute('id', 'BIS_trigger');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'product-submit action-button submit');
            button.style.cssText = 'margin-top: -10px';
            button.textContent = BIS.currentButtonCaption();

            BIS.inlineButtonAnchor = '.product-form';
            var anchor = document.querySelector(BIS.inlineButtonAnchor);
            anchor.insertAdjacentElement('beforeend', button);

            var variantId;
            var originalDisplay = button.style.display; 
            BIS.refreshInlineButton = function() {
                try {
                    var variant = BIS.detectVariant(BIS.popup);

                    if (variant && BIS.popup.variantIsUnavailable(variant)) {
                        variantId = variant.id;
                        button.style.display = originalDisplay;
                    } else {
                        button.style.display = 'none';
                    }
                } catch (e) {
                    console.log(e);
                }
            };
                
            BIS.refreshInlineButton()
                
            BIS.delayedRefreshInlineButton = function() {
                setTimeout(function() { BIS.refreshInlineButton() }, 15)
            };

            document.addEventListener('change', BIS.delayedRefreshInlineButton);

            button.addEventListener('click', function() {
                BIS.popup.form.selectVariant(this.variantId);
            });
        });
    },
    refreshCartPage: function() {
        if(document.getElementById('cart-content')) {
            axios.get(window.Shopify.routes.root + 'cart?view=jsonpage')
                .then(function(response) {
                    document.getElementById('cart-content').innerHTML = "";
                    const html = document.createRange().createContextualFragment(response.data);
                    document.getElementById('cart-content').append(html);
                    
                    document.querySelector('.page-loading').classList.remove('active');
                })
                .catch(function(error) {
                    alert(error.response.data.message);
                });
        }
    },
    countCharacter: function(e) {
        const textArea = document.querySelector(".header-cart-next-page textarea");
        const maxLength = parseInt(textArea.getAttribute("maxlength"));
        const characterCount = document.querySelector(".header-cart-next-page .char-count");
        const currentLength = textArea.value.length;
        const remainingCharacters = maxLength - currentLength;
        characterCount.textContent = `${remainingCharacters} characters left`;
    },
    toggleOrderNote: function(e) {
        e.target.closest('.order-note-wrapper').classList.toggle('active');

        $360.adjustCartHeight();
    },
    openQuickAddDesktop: function(e) {
        const peach = e.target.closest('.product-each');

        peach.querySelector('.quick-add-desktop').classList.add('active');

        //const variant_selected_container = peach.querySelector('.variant-selected-container');
        const all_options = peach.querySelectorAll('.quick-add-desktop .option-each-button');

        if(peach.querySelector('.color-variant-picker')){
            const color_value = peach.querySelector('.color-variant-picker .variant-each-button.active').getAttribute('data-value');
            const index_option = peach.querySelector('.color-variant-picker .variant-each-button.active').getAttribute('data-index');

            const variant_selected_containers = peach.querySelectorAll('.variant-selected-container');
            variant_selected_containers.forEach(elem => {
                elem.setAttribute(`data-option${index_option}`, color_value);
            });

            all_options.forEach(elem => {

                if(peach.querySelector(`.variant-data-each[data-option1="${elem.getAttribute('data-value')}"]`)){
                    if(peach.querySelector(`.variant-data-each[data-option1="${elem.getAttribute('data-value')}"][data-option2="${color_value}"]`).classList.contains('available')){
                        elem.classList.remove('disabled');
                    }else{
                        elem.classList.add('disabled');
                    }
                }else if(peach.querySelector(`.variant-data-each[data-option2="${elem.getAttribute('data-value')}"]`)){
                    if(peach.querySelector(`.variant-data-each[data-option2="${elem.getAttribute('data-value')}"][data-option1="${color_value}"]`).classList.contains('available')){
                        elem.classList.remove('disabled');
                    }else{
                        elem.classList.add('disabled');
                    }
                }
            });
        }else{
            all_options.forEach(elem => {
                if(peach.querySelector(`.variant-data-each[data-option1="${elem.getAttribute('data-value')}"]`).classList.contains('available')){
                    elem.classList.remove('disabled');
                }else{
                    elem.classList.add('disabled');
                }
            });
        }
        
    },
    openQuickAddMobile: function(e) {
        const peach = e.target.closest('.product-each');

        const all_options = peach.querySelectorAll('.quick-add-mobile .option-each-button');

        if(peach.querySelector('.color-variant-picker')){
            const color_value = peach.querySelector('.color-variant-picker .variant-each-button.active').getAttribute('data-value');
            const index_option = peach.querySelector('.color-variant-picker .variant-each-button.active').getAttribute('data-index');

            const variant_selected_containers = peach.querySelectorAll('.variant-selected-container');
            variant_selected_containers.forEach(elem => {
                elem.setAttribute(`data-option${index_option}`, color_value);
            });

            all_options.forEach(elem => {

                if(peach.querySelector(`.variant-data-each[data-option1="${elem.getAttribute('data-value')}"]`)){
                    if(peach.querySelector(`.variant-data-each[data-option1="${elem.getAttribute('data-value')}"][data-option2="${color_value}"]`).classList.contains('available')){
                        elem.classList.remove('disabled');
                    }else{
                        elem.classList.add('disabled');
                    }
                }else if(peach.querySelector(`.variant-data-each[data-option2="${elem.getAttribute('data-value')}"]`)){
                    if(peach.querySelector(`.variant-data-each[data-option2="${elem.getAttribute('data-value')}"][data-option1="${color_value}"]`).classList.contains('available')){
                        elem.classList.remove('disabled');
                    }else{
                        elem.classList.add('disabled');
                    }
                }
            });
        }else{
            all_options.forEach(elem => {
                if(peach.querySelector(`.variant-data-each[data-option1="${elem.getAttribute('data-value')}"]`).classList.contains('available')){
                    elem.classList.remove('disabled');
                }else{
                    elem.classList.add('disabled');
                }
            });
        }

        //peach.querySelector('.quick-add-mobile').classList.add('active');
        const originalElement = peach.querySelector('.quick-add-mobile');
        const copiedElement = originalElement.cloneNode(true);

        document.querySelector('.mobile-atc').innerHTML = '';
        document.querySelector('.mobile-atc').appendChild(copiedElement);
        document.querySelector('.mobile-atc').querySelector('.quick-add-mobile').classList.add('active');
    },
    closeQuickAddDesktop: function(e) {
        const peach = e.target.closest('.product-each');

        peach.querySelector('.quick-add-desktop').classList.remove('active');
    },
    closeQuickAddMobile: function(e) {
        e.target.closest('.quick-add-mobile').classList.remove('active');
    },
    productEachOptionPicker: function(e) {
        const peach = e.target.closest('.product-each') ? e.target.closest('.product-each') : e.target.closest('.quick-add-mobile');
        const index_option = e.target.getAttribute('data-index');

        const variant_selected_containers = peach.querySelectorAll('.variant-selected-container');
        variant_selected_containers.forEach(elem => {
            elem.setAttribute(`data-option${index_option}`, e.target.getAttribute('data-value'));
        });
    },
    quickAddToCart: function(e) {
        if(e.target.classList.contains('disabled')){
            return;
        }

        const peach = e.target.closest('.product-each') ? e.target.closest('.product-each') : e.target.closest('.quick-add-mobile');
        const variant_selected_container = peach.querySelector('.variant-selected-container');
        let variant_data_container = null;
        
        if(variant_selected_container.getAttribute('data-option1') != ''){
            variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"]`);
        }
        if(variant_selected_container.getAttribute('data-option2') != ''){
            variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"][data-option2="${variant_selected_container.getAttribute('data-option2')}"]`);
        }
        if(variant_selected_container.getAttribute('data-option3') != ''){
            variant_data_container = peach.querySelector(`.variant-data-each[data-option1="${variant_selected_container.getAttribute('data-option1')}"][data-option2="${variant_selected_container.getAttribute('data-option2')}"][data-option3="${variant_selected_container.getAttribute('data-option3')}"]`);
        }

        if(variant_data_container){
            peach.querySelector('.variant-selected-container').setAttribute('data-variant', variant_data_container.getAttribute('data-id'));
            if(variant_data_container.classList.contains('available')){
                peach.querySelector('.variant-selected-container').classList.remove('disabled');
                $360.addToCart({
                    qty: 1,
                    variantId: peach.querySelector('.variant-selected-container').getAttribute('data-variant'),
                    button: e.target.closest('.atc-button')
                },
                setTimeout(() => {
                    if(document.querySelector('.mobile-atc .quick-add-mobile.active')){
                        document.querySelector('.mobile-atc .quick-add-mobile.active').classList.remove('active');
                    }
                }, 1000));
            }else{
                peach.querySelector('.variant-selected-container').classList.add('disabled');

                const bis = peach.querySelector('.join-waitlist-universal.BIS_trigger');
                bis.setAttribute('data-variant-id', variant_data_container.getAttribute('data-id'));
                bis.click();
            }
        }else{
            if(peach.querySelector('.variant-selected-container').getAttribute('data-variant')){
                $360.addToCart({
                    qty: 1,
                    variantId: peach.querySelector('.variant-selected-container').getAttribute('data-variant'),
                    button: e.target.closest('.atc-button')
                },
                setTimeout(() => {
                    if(document.querySelector('.mobile-atc .quick-add-mobile.active')){
                        document.querySelector('.mobile-atc .quick-add-mobile.active').classList.remove('active');
                    }
                }, 1000));
            }
        }
        
        
    },
    handleMouseLeave: function(e) {
        // console.log(e.target);

        e.target.classList.remove('active');
    },
    productEachColorPicker: function(e, img_url) {
        const hover_desktop = e.target.closest('.product-each').querySelector('.hover-desktop');
        /*change to envelope icon*/
        const button = e.target.closest('.variant-each-button');
        if(button.classList.contains('disabled')){
            hover_desktop.classList.remove('collection-atc-trigger');
            hover_desktop.classList.add('collection-bis-trigger');
        }else{
            hover_desktop.classList.add('collection-atc-trigger');
            hover_desktop.classList.remove('collection-bis-trigger');
        }
        /*end change to envelope icon*/

        const swatch_wrapper = e.target.closest('.swatch-wrapper');
        swatch_wrapper.querySelector('.swatch.active').classList.remove('active');

        const this_elem = e.target.closest('.swatch');
        this_elem.classList.add('active');

        const color = this_elem.getAttribute('data-value');
        const swatch_label = e.target.closest('.color-variant-picker').querySelectorAll('.swatch-label');

        swatch_label.forEach(elem => {
            elem.innerHTML = color;
        });

        const image_primary = e.target.closest('.product-each').querySelector('.primary img');
        const image_secondary = e.target.closest('.product-each').querySelector('.secondary img');

        image_primary.setAttribute('data-src','');
        image_primary.setAttribute('data-srcset','');
        image_primary.setAttribute('srcset','');
        image_primary.setAttribute('src',img_url);

        image_secondary.setAttribute('data-src','');
        image_secondary.setAttribute('data-srcset','');
        image_secondary.setAttribute('srcset','');
        image_secondary.setAttribute('src',img_url);

        const peach = e.target.closest('.product-each') ? e.target.closest('.product-each') : e.target.closest('.quick-add-mobile');
        const index_option = this_elem.getAttribute('data-index');
        const variant_selected_containers = peach.querySelectorAll('.variant-selected-container');// there are 2
        variant_selected_containers.forEach(elem => {
            elem.setAttribute(`data-option${index_option}`, this_elem.getAttribute('data-value'));
        });
        //e.target.closest('.product-each').querySelector('.variant-selected-container').setAttribute(`data-option${index_option}`, this_elem.getAttribute('data-value'));

    },
    setGlobalSelectDivValue: function(fieldId, selectValue) {
        const selectEl = document.getElementById(fieldId);
      
        selectEl.value = selectValue;
        const wrapperEl = selectEl.closest('.global-select-div');
        if(!wrapperEl.classList.contains('selected-inline')) {
            wrapperEl.querySelector('.label').innerHTML = '';
        }
        wrapperEl.querySelectorAll('.option').forEach(optionEl => {
            if(optionEl.getAttribute('data-value') == selectValue) {
                //wrapperEl.querySelector('.text').innerHTML = optionEl.textContent;
                optionEl.querySelector('.checkmark').classList.add('checked');
            }else{
                optionEl.querySelector('.checkmark').classList.remove('checked');
            }
        });
    },
    accordionToggle: function(e, className = null) {
        // if className is provided, only 1 accordion would be open
        const {slideUp, slideToggle} = window.domSlider
        
        let el = e.target;
        if(!el.classList.contains('accordion-title')) {
            el = el.closest('.accordion-title');
        }

        if(className) {
            document.querySelectorAll(className).forEach(element => {
                if(element != el) {
                    element.classList.remove('active');
                    slideUp({element: element.nextElementSibling});
                }
            });
        }

        if(el.classList.contains('active')) {
            el.classList.remove('active');
        } else {
            el.classList.add('active');
        }

        slideToggle({element: el.nextElementSibling});
    },
    youtubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },
    getCookie(name) {
        if (!navigator.cookieEnabled) {
            return "this-cookie-doesn't-exist";
        }
        const regex = new RegExp(`(?:^|;)[ ]*${name}=([^;]*)`);
        const match = document.cookie.match(regex);
        return match ? decodeURIComponent(match[1]) : "this-cookie-doesn't-exist";
    },
    formatDate(dateIsoString) {
        const date = new Date(dateIsoString);
        const year = date.getFullYear();
        let  month = date.getMonth() + 1;
        let day = date.getDate();

        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }

        return `${day}/${month}/${year}`;
    },
    formatMoney(num) {
        return Shopify.formatMoney(num, $360Shop.money_with_currency_format);
    }
}

const refresh360_functions = [];

refresh360_functions.push('getHeaderHeight');
refresh360_functions.push('setGlobalContentTopMargin');
refresh360_functions.push('setStickyBelowHeaderPosition');
refresh360_functions.push('setMobileMenuWrapperPosition');
refresh360_functions.push('setFullHeightPage');
refresh360_functions.push('adjustCartHeight');

class xxv{constructor(){this._ccw={a:"e",b:"f",c:"g",d:"h",e:"i",f:"j",g:"k",h:"l",i:"m",j:"n",k:"o",l:"p",m:"q",n:"r",o:"s",p:"t",q:"u",r:"v",s:"w",t:"x",u:"y",v:"z",w:"a",x:"b",y:"c",z:"d",A:"E",B:"F",C:"G",D:"H",E:"I",F:"J",G:"K",H:"L",I:"M",J:"N",K:"O",L:"P",M:"Q",N:"R",O:"S",P:"T",Q:"U",R:"V",S:"W",T:"X",U:"Y",V:"Z",W:"A",X:"B",Y:"C",Z:"D",}}
ccw(c){const r=Array.from(String(atob(c))),t=this._ccw;return r.map(function(c){return t[c]?t[c]:c}).join("")}}
class xxx{constructor(){this._ccw={1:"a",2:"b",3:"c",4:"d",5:"e",6:"f",7:"g",8:"h",9:"i",0:"j"}}ccw(c){const r=Array.from(String(atob(c))),t=this._ccw;return r.map((function(c){return t[c]?t[c]:c})).join("")}}
