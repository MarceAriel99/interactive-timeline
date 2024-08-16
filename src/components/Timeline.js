import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import React from 'react';

function TimelineComponent({ events }) {

    // Add one last element to the timeline to represent the addition of the timeline events to the database
    events.push({
        // Get max id from the timeline events
        id: Math.max(...events.map(event => event.id)) + 1,
        // Create React element as + string
        icon: React.createElement('span', { className: 'timeline__component__element__icon__content' }, '+'),
    });

    return (
        <VerticalTimeline className='timeline__component'>
            {events.map((event, event_index) => (
                <VerticalTimelineElement
                    id={"timeline__component__element__id__" + event_index}
                    key={event_index}
                    className="timeline__component__element"
                    dateClassName='timeline__component__element__date'
                    date={event.date ? event.date.toLocaleDateString('es-ES') : ''}
                    iconClassName='timeline__component__element__icon'
                    icon={event.icon ? event.icon : null}
                    style={{ marginBottom: calculateMarginBottom(event.media) }}
                >
                    <h3 className="timeline__component__element__title"> {event.title} </h3>
                    {event.media && <Carousel
                        // If it has only one image, dont show the indicators
                        dynamicHeight={true} showThumbs={false} showStatus={false} {...event.media.length > 1 ? { showIndicators: true } : { showIndicators: false }}>
                        {event.media.map((image, image_index) => (
                            <div key={image_index}>
                                <img src={image} alt={`Image ${event.id}_${image_index}`} />
                            </div>
                        ))}
                    </Carousel>}
                    <p className="timeline__component__element__description"> {event.description} </p>
                </VerticalTimelineElement>
            ))}
        </VerticalTimeline>
    );
}

function calculateMarginBottom(media) {
    // If the event has media, add some margin to the bottom of the element
    if (!media) {
        return '0em';
    }
    return media.length > 0 ? '-10em' : '0em';
}

export default TimelineComponent;
