var app = new Vue({
    el: '#vue',
    data: {
        niveau: 1,
        show: true,
    },
    methods: {
        augmenter() {
            this.niveau++;
        },
        diminuer() {
            this.niveau--;
        }
    },



});