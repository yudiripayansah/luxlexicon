// header cart
function initSwiperYmal() {
  setTimeout(function(){
    let carouselYmal = new Swiper('.ymal-swiper', {
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
  },1000)
}
async function giftProductToggle(varId,e) {
  let checkbox = e.target
  let parent = checkbox.closest('.hcb-gifting')
  let msg = parent.querySelector('#gift-msg')
  let args = {
    variantId: varId,
    qty: 1,
    properties: {
      'Gift Message': msg.value
    }
  }
  if(checkbox.checked){
    $360.addToCart(args, function() { $360.refreshCartPage();})
  } else {
    let cart = await axios.get(window.Shopify.routes.root + 'cart.js')
    if(cart.status == 200 && cart.data && cart.data.items.length > 0){
      let giftWrap = cart.data.items.findIndex(item => item.variant_id == varId)
      let args = {
        index: giftWrap + 1,
        qty: 0
      }
      $360.updateItemQty({index: giftWrap + 1, qty: 0, groupId: null, removeSameGroup: null}, function() { $360.showHeaderCart({update: true}); $360.refreshCartPage(); const removeIteminCart = new CustomEvent('RemovedItemInCartShopify', { detail: {items:[]} }); document.dispatchEvent(removeIteminCart); })
    }
  }
}
async function checkCart() {
  let cart = await axios.get(window.Shopify.routes.root + 'cart.js')
  if(cart.status == 200 && cart.data && cart.data.items.length == 1){
    let giftWrap = cart.data.items.findIndex(item => item.properties['Gift Message'])
    if(giftWrap > -1){
      let args = {
        index: giftWrap + 1,
        qty: 0
      }
      $360.updateItemQty({index: giftWrap + 1, qty: 0, groupId: null, removeSameGroup: null}, function() { $360.showHeaderCart({update: true}); $360.refreshCartPage(); const removeIteminCart = new CustomEvent('RemovedItemInCartShopify', { detail: {items:[]} }); document.dispatchEvent(removeIteminCart); })
    }
  }
}
let giftTitle = document.querySelector('.hcb-gifting .accordion-title');
if(giftTitle != null) {
  giftTitle.addEventListener('click', function(){
    console.log('clicked title')
    $360.adjustCartHeight()
  })
}
function changePage(e) {
  changeCloseButton()
  let el = e.target
  if(!el.classList.contains('cp-btn')){
    el = el.closest('.cp-btn');
  }
  let target = el.getAttribute('data-target')
  if(target){
    let hcmPage = document.querySelectorAll('.hcm-page')
    let targetPage = document.querySelector('.hcm-page.'+target)
    let checkoutBtn = document.querySelector('#header-cart .checkout-btn')
    let nextBtn = document.querySelector('#header-cart .next-btn')
    let backBtn = document.querySelector('.header-cart-top .back-btn')
    let backIcon = backBtn.querySelector('.icon-back')
    hcmPage.forEach((i) => {
      i.classList.remove('active')
    })
    targetPage.classList.add('active')
    if(target == 'zapiet-portion'){
      checkoutBtn.classList.add('show')
      nextBtn.classList.remove('show')
      backIcon.classList.remove('hide-m')
      backBtn.setAttribute('data-target','cart-portion')
    } else {
      checkoutBtn.classList.remove('show')
      nextBtn.classList.add('show')
      backIcon.classList.add('hide-m')
      backBtn.setAttribute('data-target',false)
    }
  }
}
function changeCloseButton() {
  let closes = document.querySelectorAll('.Zapiet-Modal__Close-Button')
  closes.forEach((i) => {
    i.innerHTML = ''
  })
}
let zapietOpt = document.querySelectorAll('#storePickupApp .checkoutMethodsContainer.default .checkoutMethod')
zapietOpt.forEach((i) => {
  i.addEventListener('click',changeCloseButton)
})
changeCloseButton()