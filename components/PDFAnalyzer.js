'use client'

import GreenalysisDisplay from './GreenalysisDisplay';
import Animated from './animated/Animated';
import LoadingAnimation from './loading/LoadingAnimation';

import { useState, useEffect, useRef } from 'react';

function Uploader({ setID }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files)]);
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleUploadClick = async () => {
        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`files-${index}`, file);
        });
        try {
            const response = await fetch('/api/greenalyze', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json()
            if (data.id) {
                setID(data.id)
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const GreenalyzeButton = () => {
        return (
            <button
                type="button"
                className={`upload-button ${selectedFiles.length ? 'highlighted-background' : ''}`}
                onClick={handleUploadClick}
                disabled={!selectedFiles.length}
            >
                ⬆️&nbsp;&nbsp;Greenalyze
            </button>
        )
    }
 
    return (
        <div className='pdf-analysis-container'>
            <>
            <button 
                type="button" 
                className={`choose-file-button`}
                onClick={handleButtonClick}
            >
                {selectedFiles.length > 0 ? 'Add PDFs' : 'Select PDFs'}
            </button>
            <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />
            {
                selectedFiles.length > 0 
                && 
                <>
                    <p className='under-text'>{selectedFiles.map(file => file.name).join(', ')}</p>
                    <Animated WrappedComponent={GreenalyzeButton} />
                </>
                ||
                <p className='under-text'>ⓘ Upload the latest environmental statement of the company you would like to <b className='highlighted'>greenalyze</b></p>
            }
            </>
        </div>
    );
}

function JobDisplayer({ id }) {

    const [job, setJob] = useState(null)

    useEffect(() => {
        if (!job || !job.completed) {
        let interval;
        const fetchData = async () => {
          try {
            const response = await fetch('api/status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: id }),
            });
            const data = await response.json();
            console.log(data)
            if (data && !data.error) {
                setJob(data)
            }
          } catch (error) {
            console.log(error);
          }
        };
        interval = setInterval(fetchData, 1000);
        return () => {
          if (interval) clearInterval(interval);
        };
        }
    }, [id, job]);

    return (
        <div>
            {   
                job &&
                <GreenalysisDisplay job={job} />
            }
            {
                (!job || job.completed === false)
                &&
                <div>
                    <br/><br/>
                    <Animated WrappedComponent={LoadingAnimation} />
                </div>
            }
        </div>
    )

}

export default function PDFAnalyzer() {

    const [id, setID] = useState('')

    return (
        <>
            {
                !id 
                &&
                <Uploader setID={setID}/>
                ||
                <JobDisplayer id={id}/>
            }
        </>
    )

}
