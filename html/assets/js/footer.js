let footerVue;
document.addEventListener('DOMContentLoaded', function(e) {
    footerVue = Vue.createApp({
        delimiters: ['${', '}'],
        methods: {
            toggleCurrencySwitcher(e) {
                e.preventDefault();

                const parent = e.target.closest('.currency-selector');
                if(parent != null) {
                    parent.classList.toggle('active');
                }

                return false;
            },
            toggleLanguageSwitcher(e) {
                e.preventDefault();

                const parent = e.target.closest('.language-selector');
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
            footerAccordion(e) {
                if(window.innerWidth < 1024) {
                    $360.accordionToggle(e)
                }
            },
            setActiveCategory(e) {
                const clicked_el = e.target.closest('.category');
                const active_el = e.target.closest('.category-wrapper').querySelectorAll('.category.active');
                if(active_el.length > 0) {
                    active_el[0].classList.remove("active");
                }

                clicked_el.classList.add("active");
            },
            setLocalization() {
                document.getElementById('localization_form').submit();
            },
            setCurrency() {
                
            }
        }
    });

    footerVue.mount('#site-footer');
});