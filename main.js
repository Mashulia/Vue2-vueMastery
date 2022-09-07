const eventBus = new Vue()

Vue.component('product', {
    template:
        `<div class="product">
          <div class="product-image">
            <img :src="image" :alt="altText">
          </div>
        <div class="product-info">
      <h1>{{title}}</h1>
      <details-tab :shipping="shipping" 
      :inStock="inStock"
      :sale="sale"
      :details="details"
      :variants="variants">      
</details-tab>
      
      <button @click="addToCart"
      :disabled="!inStock"
      :class="{disabledButton: !inStock}">Add to cart</button>
      <button @click="removeFromCart">Remove</button>
    </div>
    <product-tabs :reviews="reviews"></product-tabs>
  </div>`,
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            onSale: false,
            altText: 'A pair of socks',
            link: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
            details: ['80% cotton', '20% polyester', 'Gender neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: './assets/images/vmSocks-green-onWhite.jpeg',
                    variantQty: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: './assets/images/vmSocks-blue-onWhite.jpeg',
                    variantQty: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        updateImage(index) {
            this.selectedVariant = index
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQty > 0
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on Sale!'
            }
            return this.brand + ' ' + this.product + ' are not on Sale!'
        },
        shipping() {
            if (this.premium) {
                return 'Free'
            }
            return '2.99'
        }
    },
    mounted(){
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
            console.log(this.reviews)
        })
    }
})

Vue.component('product-details', {
    template:
        `<ul>
      <li v-for="detail in details">{{detail}}</li>
    </ul>`,
    props: {
        details: {
            type: 'Array',
            required: true
        }
    }
})

Vue.component('details-tab', {
    props:{
        shipping:{
            type: String,
            required:true
        },
        inStock: {
            type: Boolean,
            default: true
        },
        sale: {
            type: String,
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        variants: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
      <p v-if="inStock">In Stock</p>
      <p v-else :class="{'outOfStock': !inStock}">Out of Stock</p>
    <span 
    class="tab"
    :class="{activeTab: selectedTab === tab}"
    @click="selectedTab = tab"
    v-for="(tab, index) in tabs"
    >{{tab}}</span>
    <div v-show="selectedTab === tabs[0]">
    <p>Shipping: {{shipping}}</p>
     <p>{{sale}}</p>
  </div>
      <div v-show="selectedTab === tabs[1]">
    <product-details :details="details"></product-details>
        <div v-for="(variant, index) in variants"
             :key="variant.variantId"
            class="color-box"
             :style="{'backgroundColor': variant.variantColor}"
             @mouseover="updateImage(index)">
        </div>
</div>
    
</div>
    `,
    data(){
        return{
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
        }
    }
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{error}}</li>
      </ul>
    </p>
      <p>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="name">
      </p>
      <p>
        <label for="review">Review:</label>
        <textarea type="textarea" id="review" v-model="review"></textarea>
      </p>
      <p>
        <label for="rating">Rating:</label>
        <select name="rating" id="rating" v-model="rating">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </p>
      <p>
        <input type="submit" value="Submit">
      </p>
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if (this.name && this.rating && this.review) {
                const productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            } else {
                if (!this.name) {
                    this.errors.push('Name required')
                }
                if (!this.review) {
                    this.errors.push('Review required')
                }
                if (!this.rating) {
                    this.errors.push('Rating required')
                }
            }
        }
    },
})

Vue.component('product-tabs', {
    props: {
        reviews:{
            type: Array,
            required: true
        }
    },
    template: `
    <div>
      <span 
      class="tab" 
      :class="{ activeTab: selectedTab === tab}"
      v-for="(tab, index) in tabs" 
      @click="selectedTab = tab"
      :key="index">{{ tab }}</span>    
    <h2>Reviews</h2>
    <div v-show="selectedTab === tabs[0]">
      <p v-if="reviews.length">
        <ul>
          <li v-for="review in reviews">
            <p>{{review.name}}</p>
            <p>Rating: {{review.rating}}</p>
            <p>{{review.review}}</p>
          </li>
        </ul>      
      </p>
      <p v-else>There are no reviews yet</p>
    </div>
    <product-review v-show="selectedTab === tabs[1]"></product-review>
    </div>
    `,
    data() {
        return {
            tabs: ['Review', 'Make a review'],
            selectedTab: 'Review'
        }
    }
})

var app = new Vue({
    el: '#app',
    data() {
        return {
            premium: false,
            cart: []
        }

    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeFromCart(id) {
            const removedItemIndex = this.cart.findIndex((item) => item.variantId === id)
            this.cart.splice(removedItemIndex, 1)
        },
    }
})