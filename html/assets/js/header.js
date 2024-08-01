let headerVue;
document.addEventListener('DOMContentLoaded', function(e) {
    headerVue = Vue.createApp({
        delimiters: ['${', '}'],
        data() {
            return {
                showHeaderBar: true,
                showSearchForm: false,
                activeSubmenu: null,
                showMobileMenu: false,
                hideSiteHeader: false,
                prevScrollPos: 0
            }
        },
        mounted() {
            const this_obj = this;

            this.siteHeaderHideShowBehaviour();

            //-- open cart drawer on first load
            const urlSearchParams = new URLSearchParams(window.location.search);
            const param = urlSearchParams.get('drawer');
            if(param == 'true') {
                this_obj.showHeaderCart();
            }

            //-- link back mobile clicked
            const mobile_menu_wrapper = document.querySelector('.mobile-menu-wrapper');
            mobile_menu_wrapper.addEventListener('click', function(event){
                if(event.target.closest('#link-back-mobile')) {
                    event.preventDefault();
                    this_obj.hideMobileMenuDrop(event);
                }

                return false;
            });

            //-- page overlay clicked
            const page_overlay = document.querySelector('.header-overlay');
            page_overlay.addEventListener('click', function(event){
                if(window.innerWidth < 1024) {
                    this_obj.toggleMobileMenu();
                }
                this_obj.showSearchForm = false;
            });

            //-- page overlay global clicked
            const page_overlay_global = document.querySelector('.page-overlay.header-cart-overlay');
            page_overlay_global.addEventListener('click', function(event){
                this_obj.showSearchForm = false;
            });

            //-- check no-bar cookie
            if($360.getCookie('hide_ann_bar') == 'true') {
                this_obj.removeAnnBar();
            }

            //-- set menu dropdown top position
            const desktopDropdowns = document.querySelectorAll('#header-con .menu-dropdown');
            const mobileMenuWrapper = document.querySelector('#header-con .mobile-menu-wrapper');
            const headerHeight = document.querySelector('.site-header').offsetHeight;
            const headerMenuHeight = document.querySelector('.site-header .header-con-outer').offsetHeight;
            if(screen.width > 1023) {
                desktopDropdowns.forEach(function(desktopDropdown){
                    if($360.getCookie('hide_ann_bar') == 'true') {
                        desktopDropdown.style.top = `${headerMenuHeight-1}px`;
                    } else {
                        desktopDropdown.style.top = `${headerHeight-1}px`;
                    }
                });
            }

            //-- search view all clicked
            document.addEventListener('click', function(e){
                if(e.target.classList.contains('search-view-all')){
                    e.preventDefault();
                    this_obj.clickViewAll();
                }
            });

            //-- collection filter hover behaviour
            const collection_filter = document.querySelector('#collection-filter');
            if(collection_filter != null) {
                collection_filter.classList.remove('zi-6');
                collection_filter.classList.add('zi-2');

                collection_filter.addEventListener('mouseenter', function(event){
                    event.stopPropagation();
                    collection_filter.classList.add('zi-6');
                    collection_filter.classList.remove('zi-2');
                });
                collection_filter.addEventListener('mouseleave', function(event){
                    event.stopPropagation();
                    const filter_overlay = this.querySelector('.page-overlay');
                    if(filter_overlay != null && !filter_overlay.classList.contains('active')) {
                        collection_filter.classList.add('zi-2');
                        collection_filter.classList.remove('zi-6');
                    }
                });
            }

        },
        methods: {
            toggleCurrencySwitcher(e) {
                e.preventDefault();

                const parent = e.target.closest('.currency-selector');
                if(parent != null) {
                    parent.classList.toggle('active');
                }

                return false;
            },
            changeCountry(iso_code,e) {
                e.preventDefault();
                const country_field = e.target.closest('.currency-selector').querySelector('input[name="country_code"]');
                country_field.value = iso_code;
                country_field.closest('form').submit();

                return false;
            },
            setCookie(name, value, days) {
                let expires = "";
                if (days) {
                    const date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = name + "=" + (value || "") + expires + "; path=/";
            },
            closeAnnBar(event) {
                event.preventDefault();
                
                /* set cookie expired in 2 days */
                this.setCookie('hide_ann_bar','true',2);
                this.removeAnnBar();
            },
            removeAnnBar() {
                const site_header = document.querySelector('.site-header');
                const ann_bar = document.querySelector('.header-bar');
                const body = document.querySelector('body');
                const global_content_tm = document.querySelector('.global-content-top-margin');

                if(site_header != null) {
                    if(ann_bar != null) {
                        ann_bar.remove();
                    }

                    body.classList.add('no-bar');

                    $360.headerHeight = site_header.querySelector('.header-con-outer').offsetHeight;
                    if(global_content_tm != null) {
                        global_content_tm.style.marginTop = `-${ann_bar.offsetHeight}px`;
                    }

                    if(site_header.classList.contains('transparent')) {
                        const first_section = document.querySelector('.global-content-top-margin .shopify-section:first-child');
                        if(first_section != null) {
                            first_section.style.marginTop = `-${$360.headerHeight+ann_bar.offsetHeight}px`;
                        }
                    }
                }
            },
            headerSearchHandler(event) {
                if(event != null) {
                    event.preventDefault();
                }

                const body = document.querySelector('body');
                const filter_bar = document.querySelector('#collection-filter');
                const sticky_elem = document.querySelector('.has-sticky-elem');
                const page_overlay_global = document.querySelector('.page-overlay.header-cart-overlay');

                if(!body.classList.contains('no-overflow')) {
                    /*
                    if(filter_bar != null) {
                        filter_bar.classList.remove('zi-6');
                        filter_bar.classList.add('zi-2');
                    }
                    */
                    if(sticky_elem != null) {
                        sticky_elem.classList.add('zi-2');
                    }

                    this.showSearchForm = !this.showSearchForm;
                } else {
                    const delay = setTimeout(() => {
                        /*
                        if(filter_bar != null) {
                            filter_bar.classList.remove('zi-2');
                            filter_bar.classList.add('zi-6');
                        }
                        */
                        if(sticky_elem != null) {
                            sticky_elem.classList.remove('zi-2');
                        }
                        this.showSearchForm = !this.showSearchForm;
                        
                        clearTimeout(delay);
                    }, 500);
                }

                if(page_overlay_global != null) {
                    page_overlay_global.classList.toggle('active');
                }

                return false;
            },
            handleKeyDown(event) {
                if (event.key === 'Enter') {
                    window.location.href = '/search?type=product&q='+document.querySelector('#search-term').value+'';
                }
            },
            clickViewAll() {
                window.location.href = '/search?type=product&q='+document.querySelector('#search-term').value+'';
            },
            async goSearch() {
                try {
                    let resultContainer = document.querySelector('#sm-search-result');
                    const suggestion_elem = document.querySelector('.suggestion-wrapper');
                    const req = await $360.getSearchContent('filtered', this.q);
                    let {data, status} = req;

                    if(this.q.trim() == '') {
                        if(suggestion_elem != null) {
                            suggestion_elem.classList.remove('hide-m');
                        }

                        resultContainer.innerHTML = '';
                    } else {
                        if(suggestion_elem != null) {
                            suggestion_elem.classList.add('hide-m');
                        }

                        resultContainer.innerHTML = data;
                    }
                    
                    $360.lazyLoadInstance.update();
                } catch (error) {
                    console.log(error)
                }
            },
            goSearchMobile() {
                let box = document.querySelector('.serp-mobile-box');
                let head = document.querySelector('.terms-mobile');
                let serp = document.querySelector('.serp-mobile');
                let sicon = document.querySelector('.sicon-mobile');
                let loader = document.querySelector('.sloading-mobile');
                if(this.qmobile.length > 0) {
                    sicon.classList.add('shide');
                    loader.classList.remove('shide');
                    loader.classList.add('sshow');
                    const ctn = $360.getSearchContent('autosuggest', this.qmobile+' -tag:hidden');
                    // console.log('ctn', ctn);
                    ctn.then(res => {
                        // console.log('data', res.data);
                        head.innerHTML = this.qmobile;
                        serp.innerHTML = res.data;
                        slideDown({element: box});
                        sicon.classList.remove('shide');
                        loader.classList.remove('sshow');
                        loader.classList.add('shide');
                    })
                    .catch(err => {
                        console.error(err);
                        alert(err.response.data.message);
                    });
                } else {
                    sicon.classList.remove('shide');
                    loader.classList.remove('sshow');
                    loader.classList.add('shide');
                    head.innerHTML = '';
                    serp.innerHTML = '';
                    slideUp({element: box});
                }
            },
            setStickyElemsToAbove() {
                const filter_bar = document.querySelector('#collection-filter');
                const sticky_elem = document.querySelector('.has-sticky-elem');

                /*
                if(filter_bar != null) {
                    filter_bar.classList.remove('zi-2');
                    filter_bar.classList.add('zi-6');
                }
                */
                if(sticky_elem != null) {
                    sticky_elem.classList.remove('zi-2');
                }
            },
            siteHeaderHideShowBehaviour() {
                const doc = document.documentElement;
                const body = document.body;
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const headerBarHeight = document.querySelector('#header-bar').offsetHeight;
                const headerMenuHeight = document.querySelector('.site-header .header-con-outer').offsetHeight;
                const siteHeaderObj = document.querySelector('.site-header');
                const mobileMenuWrapper = document.querySelector('#header-con .mobile-menu-wrapper');
                const headerConObj = document.querySelector('#shopify-section-header');
                let announcementBar = document.querySelector('#header-bar');
                let hideHeight = 0;
                let dropdownPos = 0;
                const this_obj = this;
 
                window.addEventListener("scroll", () => {
                    const scrollPos = Math.max(doc.scrollTop, body.scrollTop);
                    const scrollDirection = scrollPos > this_obj.prevScrollPos ? "down" : "up";
                    
                    // Output the scroll down value to the console
                    if(scrollDirection == 'down' && scrollPos > headerHeight) {
                        this_obj.hideSiteHeader = true;
                        siteHeaderObj.classList.remove('scroll-top');
                        headerConObj.classList.remove('scroll-top');
                        siteHeaderObj.classList.add('scroll-down');
                        headerConObj.classList.add('scroll-down');

                        if(announcementBar != null) {
                            hideHeight = announcementBar.offsetHeight;
                        }

                        headerConObj.style.top = `-${headerHeight}px`;

                        //-- hide submenu
                        if(document.querySelector(`#header-con .menu-dropdown.show`) != null) {
                            document.querySelector(`#header-con .menu-dropdown.show`).classList.add('waiting-inactive');
                            document.querySelector(`#header-con .menu-dropdown.show`).classList.remove('show');
                                
                            const delay_hide = setTimeout(() => {
                                document.querySelector(`#header-con .menu-dropdown.waiting-inactive`).classList.remove('waiting-inactive');
                                this_obj.activeSubmenu = null;
    
                                clearTimeout(delay_hide);
                            }, 50);
                        }

                        // adjust sticky div on PDP (desktop only)
                        if(document.querySelector('.product-info-outer-wrapper') != null && screen.width > 1023) {
                            const pdp_info_outer_wrapper = document.querySelector('.product-info-outer-wrapper');
                            pdp_info_outer_wrapper.style.top = '68px';
                        } 

                        // adjust sticky div for collection tabbed
                        if(document.querySelector('.collection-tabbed') != null && screen.width > 1023) {
                            const collection_tabbed_info = document.querySelector('.collection-tabbed .ctc-tabs');
                            collection_tabbed_info.style.top = '40px';
                        }

                        // adjust sticky div on cart (tablet up)
                        if(document.querySelector('.cart-right .inner.t-sticky') != null && screen.width > 767) {
                            const sticky_elem = document.querySelector('.cart-right .inner.t-sticky');
                            sticky_elem.style.top = '50px';
                        }
                        // adjust collection filter
                        if(document.querySelector('#collection-filter')) {
                            const collection_filter_elem = document.querySelector('#collection-filter');
                            collection_filter_elem.style.top = '0';
                            collection_filter_elem.classList.add("going-down");
                            collection_filter_elem.classList.remove("going-up");
                        }
                    } else if (scrollDirection == 'up') {
                        siteHeaderObj.classList.remove('scroll-down');
                        headerConObj.classList.remove('scroll-down');
                        

                        // adjust collection filter
                        if(document.querySelector('#collection-filter')) {
                            const collection_filter_elem = document.querySelector('#collection-filter');
                            collection_filter_elem.style.top = `${headerHeight-headerBarHeight - 0.5}px`;
                            collection_filter_elem.classList.remove("going-down");
                            collection_filter_elem.classList.add("going-up");
                        }

                        // adjust sticky div on PDP (desktop only)
                        if(document.querySelector('.product-info-outer-wrapper') != null && screen.width > 1023) {
                            const pdp_info_outer_wrapper = document.querySelector('.product-info-outer-wrapper');
                            pdp_info_outer_wrapper.style.top = '80px';
                        } 

                        // adjust sticky div for collection tabbed
                        if(document.querySelector('.collection-tabbed') != null && screen.width > 1023) {
                            const collection_tabbed_info = document.querySelector('.collection-tabbed .ctc-tabs');
                            collection_tabbed_info.style.top = '150px';
                        }

                        // adjust sticky div on cart (tablet up)
                        if(document.querySelector('.cart-right .inner.t-sticky') != null && screen.width > 767) {
                            const sticky_elem = document.querySelector('.cart-right .inner.t-sticky');
                            sticky_elem.style.top = '150px';
                        }

                        if(scrollPos <= headerHeight) {
                            this_obj.hideSiteHeader = false;
                            siteHeaderObj.classList.remove('scroll-top');
                            headerConObj.classList.remove('scroll-top');

                            if($360.getCookie('hide_ann_bar') == 'true') {
                                dropdownPos = headerMenuHeight;
                            } else {
                                dropdownPos = headerHeight;
                            }

                            if(!body.classList.contains('no-bar')) {
                                headerConObj.style.top = `0`;
                            }
                        } else {
                            if($360.getCookie('hide_ann_bar') == 'true') {
                                siteHeaderObj.style.transform = 'translateY(0)';
                            } 
                            
                            headerConObj.style.top = `-${hideHeight}px`;
                            siteHeaderObj.classList.add('scroll-top');
                            headerConObj.classList.add('scroll-top');
                            dropdownPos = headerMenuHeight;
                        }

                        // set menu dropdown top position
                        const desktopDropdowns = document.querySelectorAll('#header-con .menu-dropdown');
                        if(screen.width > 1023) {
                            desktopDropdowns.forEach(function(desktopDropdown){
                                desktopDropdown.style.top = `${dropdownPos-1}px`;
                            });
                        }
                    }

                    this_obj.prevScrollPos = scrollPos;
                    this_obj.activeSubmenu = null;
                });
            },
            showHeaderCart() {
                $360.showHeaderCart();
            },
            mainNavMouseLeave(e) {
                const delay = setTimeout(() => {
                    const header_links = document.querySelectorAll('.header-nav .header-link');
                    header_links.forEach(function(header_link){
                        header_link.classList.remove('mouseover');
                    });

                    clearTimeout(delay);
                }, 200);
            },
            showDropdown(num,e) {
                const this_obj = this;
                const filter_bar = document.querySelector('#collection-filter');
                const sticky_elem = document.querySelector('.has-sticky-elem');

                if(!e.target.closest('.parent').classList.contains('with-children')) {
                    if(document.querySelector(`#header-con .menu-dropdown.waiting-inactive`) != null) {
                        document.querySelector(`#header-con .menu-dropdown.waiting-inactive`).classList.remove('waiting-inactive');

                        this_obj.activeSubmenu = null;
                    }
                    
                    const delay_check = setTimeout(() => {
                        if(document.querySelector(`#header-con .menu-dropdown.show`) != null) {
                            document.querySelector(`#header-con .menu-dropdown.show`).classList.add('waiting-inactive');
                            document.querySelector(`#header-con .menu-dropdown.show`).classList.remove('show');
                            document.querySelector('.site-header').classList.remove('menu-dropdown-show');

                            const delay_hide = setTimeout(() => {
                                document.querySelector(`#header-con .menu-dropdown.waiting-inactive`).classList.remove('waiting-inactive');
                                this_obj.activeSubmenu = null;

                                /*
                                if(filter_bar != null) {
                                    filter_bar.classList.remove('zi-2');
                                    filter_bar.classList.add('zi-6');
                                }
                                */
                                if(sticky_elem != null) {
                                    sticky_elem.classList.remove('zi-2');
                                }
    
                                clearTimeout(delay_hide);
                            }, 50);
                        }

                        clearTimeout(delay_check);
                    }, 100);
                } else {
                    if(document.querySelector(`#header-con .menu-dropdown.show`) != null) {
                        if(num != this.activeSubmenu) {
                            document.querySelector(`#header-con .menu-dropdown.show`).classList.add('waiting-inactive');
    
                            if(document.getElementById(`menu-dropdown-${num}`)) {
                                /*
                                if(filter_bar != null) {
                                    filter_bar.classList.remove('zi-6');
                                    filter_bar.classList.add('zi-2');
                                }
                                */
                                if(sticky_elem != null) {
                                    sticky_elem.classList.add('zi-2');
                                }

                                document.getElementById(`menu-dropdown-${num}`).classList.add('show');
                                document.querySelector('.site-header').classList.add('menu-dropdown-show');
                            }
                            
                            const delay_hide = setTimeout(() => {
                                document.querySelector(`#header-con .menu-dropdown.waiting-inactive`).classList.remove('waiting-inactive');
                                this_obj.activeSubmenu = num;
    
                                clearTimeout(delay_hide);
                            }, 300);
                        }
                    } else {
                        /*
                        if(filter_bar != null) {
                            filter_bar.classList.remove('zi-6');
                            filter_bar.classList.add('zi-2');
                        }
                        */
                        if(sticky_elem != null) {
                            sticky_elem.classList.add('zi-2');
                        }
                        
                        document.querySelector('.site-header').classList.add('menu-dropdown-show');
                        this.activeSubmenu = num;
                        $360.lazyLoadInstance.update();
                    }
                }

                const delay = setTimeout(() => {
                    const this_link = e.target.closest('.parent');
                    const header_links = document.querySelectorAll('.header-nav .header-link');
                    header_links.forEach(function(header_link){
                        header_link.classList.add('mouseover')

                        if(header_link.closest('.parent') == this_link) {
                            header_link.classList.remove('mouseover'); 
                        }
                    });

                    clearTimeout(delay);
                }, 100);
            },
            mobileMenuAccordion(e) {
                if(window.innerWidth < 1024) {
                    $360.accordionToggle(e)
                }
            },
            toggleMobileMenu(e) {
                if(e != null) {
                    e.preventDefault();
                }

                this.showMobileMenu = !this.showMobileMenu;
                const iconMenu = document.querySelector('.header-mobile-menu .icon-menu');
                const iconCloseMenu = document.querySelector('.header-mobile-menu .icon-close-menu');
                const body = document.querySelector('body');
                const page_overlay = document.querySelector('.header-overlay');
                const filter_bar = document.querySelector('#collection-filter');
                const sticky_elem = document.querySelector('.has-sticky-elem');

                if(this.showMobileMenu) {
                    /*
                    if(filter_bar != null) {
                        filter_bar.classList.remove('zi-6');
                        filter_bar.classList.add('zi-2');
                    }
                    */
                    if(sticky_elem != null) {
                        sticky_elem.classList.add('zi-2');
                    }

                    iconMenu.classList.remove('flex');
                    iconMenu.classList.add('hide-m');
                    iconCloseMenu.classList.remove('hide-m');
                    iconCloseMenu.classList.add('flex');
                    body.classList.add('nooverflow');
                    page_overlay.classList.add('show-mobile');

                    let delay = setTimeout(() => {
                        page_overlay.classList.add('show-fade');
                        $360.lazyLoadInstance.update();
                        
                        clearTimeout(delay);
                    }, 50);
                } else {
                    iconMenu.classList.remove('hide-m');
                    iconMenu.classList.add('flex');
                    iconCloseMenu.classList.remove('flex');
                    iconCloseMenu.classList.add('hide-m');
                    body.classList.remove('nooverflow');
                    page_overlay.classList.remove('show-fade');

                    let delay = setTimeout(() => {
                        page_overlay.classList.remove('show-mobile');
                        /*
                        if(filter_bar != null) {
                            filter_bar.classList.remove('zi-2');
                            filter_bar.classList.add('zi-6');
                        }
                        */
                        if(sticky_elem != null) {
                            sticky_elem.classList.remove('zi-2');
                        }
                        
                        clearTimeout(delay);
                    }, 500);
                }

                return false;
            },
            toggleMobileMenuDrop(e, title) {
                let el = e.target.classList.contains('main-menu-title') ? e.target : e.target.closest('.main-menu-title');
                if(el.closest('li').classList.contains('with-children')) {
                    if(!el.closest('.parent').classList.contains('active')) {
                        const active_menu = document.querySelector('.mobile-menu .parent.active');
                        if(active_menu != null) {
                            active_menu.classList.remove('active');
                        }
                        el.closest('.parent').classList.add('active');

                        const active_dropdown = document.querySelector(`.menu-dropdown-mobile-wrapper .mobile-menu-dropdown:not(.hide-m)`);
                        if(active_dropdown != null) {
                            active_dropdown.classList.add('hide-m');
                        }

                        const current_active_dropdown = document.querySelector(`.menu-dropdown-mobile-wrapper .mobile-menu-dropdown[data-title="${title}"]`);
                        if(current_active_dropdown != null) {
                            current_active_dropdown.classList.remove('hide-m');
                        }
                    }
                } else {
                    window.location.href = el.getAttribute('href');
                }

            },
            hideMobileMenuDrop(e) {
                const parent = e.target.closest('.parent'); 
                const dropdown_el = parent.querySelector('.mobile-menu-dropdown');
                const mobile_menu_wrapper = e.target.closest('.mobile-menu-wrapper');
                mobile_menu_wrapper.classList.remove('nooverflow');

                if(parent.classList.contains('submenu-open')) {
                    dropdown_el.classList.remove('show');

                    const delay = setTimeout(() => {
                        dropdown_el.classList.add('hide-m');
                        parent.classList.remove('submenu-open');     
                        
                        clearTimeout(delay);
                    }, 300);
                }
            }
        }
    });

    headerVue.mount('#header-con');
});