function onScanSuccess(qrCodeMessage) {
    // Redirect to the scanned URL
    window.location.href = qrCodeMessage;
}

function onScanError(errorMessage) {
    console.error(errorMessage);
}

var html5QrCodeScanner;

function toggleQRScanner() {
    var tezModeButton = document.getElementById('tezModeButton');
    var qrScannerContainer = document.getElementById('qrScannerContainer');
    if (qrScannerContainer.style.display === 'none') {
        qrScannerContainer.style.display = 'block';
        tezModeButton.style.display = 'none'; // Hide the Tez mode button
        if (!html5QrCodeScanner) {
            html5QrCodeScanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: 250,
                preferFrontCamera: false, // Set to false to use back camera
                formatsToShow: []
            });
            html5QrCodeScanner.render(onScanSuccess, onScanError);
        }
    } else {
        qrScannerContainer.style.display = 'none';
        tezModeButton.style.display = 'block'; // Show the Tez mode button
        // Stop the scanner if it's already initialized
        if (html5QrCodeScanner) {
            html5QrCodeScanner.stop();
            html5QrCodeScanner = null;
        }
    }
}



$(document).ready(function() {

$(window).scroll(function(){
$('.tez').css("opacity", 1- $(window).scrollTop() / 300) 
})

});