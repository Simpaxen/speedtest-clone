document.getElementById('start-btn').addEventListener('click', async () => {
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

    const setProgress = (percent) => progressBar.style.width = `${percent}%`;
    const setActiveBox = (box) => {
        [pingBox, downloadBox, uploadBox].forEach(b => b.classList.remove('active'));
        if (box) box.classList.add('active');
    };

    try {
        // PING
        setActiveBox(pingBox);
        let pingTotal = 0;
        const pingCount = 4;
        
        for (let i = 0; i < pingCount; i++) {
            const startTime = performance.now();
            await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3e/Tokyo_Sky_Tree_2012.JPG', { 
                method: 'HEAD', cache: 'no-store' 
            });
            pingTotal += (performance.now() - startTime);
            setProgress((i + 1) / pingCount * 15);
        }
        pingResult.innerText = Math.round(pingTotal / pingCount);

        // PARALLELL NEDLADDNING 
        setActiveBox(downloadBox);
        const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3e/Tokyo_Sky_Tree_2012.JPG";
        const downloadDuration = 5000;
        const numDlConnections = 6; // 6 trådar samtidigt
        const dlStartTime = Date.now();
        let dlTotalBytes = 0;

        const dlInterval = setInterval(() => {
            const elapsedTime = (Date.now() - dlStartTime) / 1000;
            if (elapsedTime > 0) {
                downloadResult.innerText = ((dlTotalBytes * 8) / elapsedTime / 1000000).toFixed(2);
                setProgress(15 + Math.min((elapsedTime / 5) * 45, 45));
            }
        }, 100);

        const downloadWorker = async () => {
            while (Date.now() - dlStartTime < downloadDuration) {
                try {
                    const response = await fetch(imageUrl + "?nnn=" + Math.random(), { cache: 'no-store' });
                    const reader = response.body.getReader();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done || (Date.now() - dlStartTime >= downloadDuration)) break;
                        dlTotalBytes += value.length;
                    }
                } catch (e) { break; }
            }
        };

        // Starta alla nedladdningstrådar samtidigt
        await Promise.all(Array.from({ length: numDlConnections }, () => downloadWorker()));
        clearInterval(dlInterval);
        
        const dlTotalTime = (Date.now() - dlStartTime) / 1000;
        downloadResult.innerText = ((dlTotalBytes * 8) / dlTotalTime / 1000000).toFixed(2);
        setProgress(60);

        // PARALLELL UPPLADDNING 
        setActiveBox(uploadBox);
        const uploadDuration = 5000;
        const numUlConnections = 4; // 4 trådar samtidigt
        const ulStartTime = Date.now();
        let ulTotalBytes = 0;
        const dummyData = new Uint8Array(1024 * 1024 * 2); // 2 MB klumpar

        const ulInterval = setInterval(() => {
            const elapsedTime = (Date.now() - ulStartTime) / 1000;
            if (elapsedTime > 0 && ulTotalBytes > 0) {
                uploadResult.innerText = ((ulTotalBytes * 8) / elapsedTime / 1000000).toFixed(2);
            }
            setProgress(60 + Math.min((elapsedTime / 5) * 40, 40));
        }, 100);

        const uploadWorker = async () => {
            while (Date.now() - ulStartTime < uploadDuration) {
                try {
                    await fetch('https://httpbin.org/post', {
                        method: 'POST',
                        body: dummyData,
                        headers: { 'Content-Type': 'application/octet-stream' },
                        cache: 'no-store'
                    });
                    ulTotalBytes += dummyData.length;
                } catch(e) { break; }
            }
        };

        // Starta alla uppladdningstrådar samtidigt
        await Promise.all(Array.from({ length: numUlConnections }, () => uploadWorker()));
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