import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import React from 'react';
import { useEffect } from "react";

// TODO: Add a search bar to filter events by title or description
function TimelineComponent({ events }) {

    // If the last element doesn't exist
    if (events.at(-1).key != 'plus_button') {
        // Add one last element to the timeline to represent the addition of the timeline events to the database
        events.push({
            // Get max id from the timeline events
            id: Math.max(...events.map(event => event.id)) + 1,
            // Change the key
            key: 'plus_button',
            // Create React element as + string
            icon: React.createElement('span', { className: 'timeline__component__element__icon__content' }, '+'),
        });
    }

    useEffect(() => {

        //Set onclick method for buttons
        Array.from(document.getElementsByClassName('control-arrow')).map(button => {button.style.zIndex = '9' ; button.onclick = function() {recalculateMarginBottom(events)}});

        Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
            recalculateMarginBottom(events);
        });

    }, []);

    async function recalculateMarginBottom(events) {

        // This sleep is needed because if the method executes too fast after selecting another image of the carrousel, the query selector still queries the old image
        await sleep(100);
    
        for (let index = 0; index < events.length - 1; index++) {
            const current_event = events[index];
            const next_event = events[index + 1];
    
            //console.log("CURRENT EVENT: ", current_event.title);
            //console.log("NEXT EVENT: ", next_event.title);
    
            var current_event_timeline_component = document.querySelector('#timeline__component__element__id__' + current_event.id);
            var next_event_timeline_component = document.querySelector('#timeline__component__element__id__' + next_event.id);

            if (!current_event_timeline_component || !next_event_timeline_component){
                continue;
            }

            var current_event_carrousel = current_event_timeline_component.querySelector('.vertical-timeline-element-content').querySelector('.carousel-root');
            var next_event_carrousel = next_event_timeline_component.querySelector('.vertical-timeline-element-content').querySelector('.carousel-root');

            if (!current_event_carrousel || !next_event_carrousel){
                current_event_timeline_component.style.marginBottom = '-50px';
                continue;
            }

            var current_event_image_container = current_event_carrousel.querySelector('.carousel').querySelector('.slider-wrapper').querySelector('.slider').querySelector('.selected').querySelector('div').querySelector('img');
            var next_event_image_container = next_event_carrousel.querySelector('.carousel').querySelector('.slider-wrapper').querySelector('.slider').querySelector('.selected').querySelector('div').querySelector('img');
    
            //console.log("CURRENT EVENT: ", current_event.title, current_event_image_container, current_event_image_container.offsetHeight);
            //console.log("NEXT EVENT: ", next_event.title, next_event_image_container, next_event_image_container.offsetHeight);
    
            const current_event_image_container_height_half = current_event_image_container.offsetHeight / 2;
            const next_event_image_container_height_half = next_event_image_container.offsetHeight / 2;
    
            var next_is_taller_than_current = next_event_image_container_height_half > current_event_image_container_height_half * 2;
            if (index === 0){
                next_is_taller_than_current = false;
            }
            
            const margin_bottom_value = (next_is_taller_than_current) ? '0px' : '-' + (next_event_image_container_height_half * 1.0).toString() + 'px';
            //console.log("CHANGE TO: ", margin_bottom_value, current_event.title);
            current_event_timeline_component.style.marginBottom = margin_bottom_value;
        };
    }

    return (
        <VerticalTimeline className='timeline__component'>
            {events.map((event) => (
                <VerticalTimelineElement
                    id={"timeline__component__element__id__" + event.id}
                    key={event.id}
                    className="timeline__component__element"
                    dateClassName='timeline__component__element__date'
                    date={event.date ? event.date.toLocaleDateString('es-ES') : ''}
                    iconClassName='timeline__component__element__icon'
                    icon={event.icon ? event.icon : null}
                >
                    <h3 className="timeline__component__element__title"> {event.title} </h3>
                    {event.media && <Carousel
                        // If it has only one image, dont show the indicators
                        dynamicHeight={true} showThumbs={false} showStatus={false} {...event.media.length > 1 ? { showIndicators: true } : { showIndicators: false }}>
                        {event.media.map((image, image_index) => (
                            <div key={image_index}>
                                <img id={image} src={image} alt={`Image ${event.id}_${image_index}`} />
                            </div>
                        ))}
                    </Carousel>}
                    <p className="timeline__component__element__description"> {event.description} </p>
                </VerticalTimelineElement>
            ))}
        </VerticalTimeline>
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default TimelineComponent;
