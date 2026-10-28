document.getElementById('start-btn').addEventListener('click', async () => {
    // 1. Hämta alla element vi behöver uppdatera
    const startBtn = document.getElementById('start-btn');
    const pingResult = document.getElementById('ping-result');
    const downloadResult = document.getElementById('download-result');
    const uploadResult = document.getElementById('upload-result');
    
    const pingBox = document.getElementById('ping-box');
    const downloadBox = document.getElementById('download-box');
    const uploadBox = document.getElementById('upload-box');
    
    const progressBar = document.getElementById('progress-bar');
    const progressWrapper = document.querySelector('.progress-wrapper');

    startBtn.disabled = true;
    startBtn.innerText = "Mäter...";
    pingResult.innerText = "--";
    downloadResult.innerText = "--";
    uploadResult.innerText = "--";
    
    progressWrapper.classList.add('show');
    progressBar.style.width = '0%';

    // Hjälpfunktioner för att uppdatera UI
    const setProgress = (percent) => {
        progressBar.style.width = `${percent}%`;
    };

    const setActiveBox = (box) => {
        pingBox.classList.remove('active');
        downloadBox.classList.remove('active');
        uploadBox.classList.remove('active');
        if (box) box.classList.add('active');
    };

    try {
        setActiveBox(pingBox);
        let pingTotal = 0;
        const pingCount = 4;
        
        for (let i = 0; i < pingCount; i++) {
            const startTime = performance.now();
            await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3e/Tokyo_Sky_Tree_2012.JPG', { 
                method: 'HEAD', 
                cache: 'no-store' 
            });
            const endTime = performance.now();
            pingTotal += (endTime - startTime);
            setProgress((i + 1) / pingCount * 15); // Ping tar de första 15% av mätaren
        }
        
        const averagePing = Math.round(pingTotal / pingCount);
        pingResult.innerText = averagePing;

        setActiveBox(downloadBox);
        const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3e/Tokyo_Sky_Tree_2012.JPG";
        const downloadDuration = 5000;
        const dlStartTime = Date.now();
        let dlTotalBytes = 0;

        const dlInterval = setInterval(() => {
            const elapsedTime = (Date.now() - dlStartTime) / 1000;
            if (elapsedTime > 0) {
                const speedMbps = ((dlTotalBytes * 8) / elapsedTime / 1000000).toFixed(2);
                downloadResult.innerText = speedMbps;

                setProgress(15 + Math.min((elapsedTime / 5) * 45, 45));
            }
        }, 100);

        while (Date.now() - dlStartTime < downloadDuration) {
            const response = await fetch(imageUrl + "?nnn=" + Math.random());
            const reader = response.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done || (Date.now() - dlStartTime >= downloadDuration)) break;
                dlTotalBytes += value.length;
            }
        }
        clearInterval(dlInterval);
        
        const dlTotalTime = (Date.now() - dlStartTime) / 1000;
        downloadResult.innerText = ((dlTotalBytes * 8) / dlTotalTime / 1000000).toFixed(2);
        setProgress(60);

        setActiveBox(uploadBox);
        const uploadDuration = 5000;
        const ulStartTime = Date.now();
        let ulTotalBytes = 0;

        const dummyData = new Uint8Array(1024 * 1024); 

        const ulInterval = setInterval(() => {
            const elapsedTime = (Date.now() - ulStartTime) / 1000;
            if (elapsedTime > 0 && ulTotalBytes > 0) {
                const speedMbps = ((ulTotalBytes * 8) / elapsedTime / 1000000).toFixed(2);
                uploadResult.innerText = speedMbps;
            }
            // Uppdatera mätaren från 60% upp till 100%
            setProgress(60 + Math.min((elapsedTime / 5) * 40, 40));
        }, 100);

        while (Date.now() - ulStartTime < uploadDuration) {
            try {
                await fetch('https://httpbin.org/post', {
                    method: 'POST',
                    body: dummyData,
                    headers: { 'Content-Type': 'application/octet-stream' }
                });
                ulTotalBytes += dummyData.length;
            } catch(e) {
                console.warn("Upload request failed", e);
                break;
            }
        }
        
        clearInterval(ulInterval);
        const ulTotalTime = (Date.now() - ulStartTime) / 1000;
        const finalUlSpeed = ((ulTotalBytes * 8) / ulTotalTime / 1000000).toFixed(2);
        uploadResult.innerText = finalUlSpeed > 0 ? finalUlSpeed : "0.00";
        
        setProgress(100);

        setTimeout(() => {
            progressWrapper.classList.remove('show');
            setActiveBox(null);
        }, 1000);

    } catch (error) {
        console.error("Något gick fel under mätningen:", error);
        downloadResult.innerText = "Fel";
        uploadResult.innerText = "Fel";
    }

    startBtn.innerText = "Starta mätning";
    startBtn.disabled = false;
});