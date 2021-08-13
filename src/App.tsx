import { useEffect, useRef } from 'react'
import './App.css'

type Vector = {
    x: number
    y: number
}

class Particle {
    position: Vector
    velocity: Vector
    color = '#ffffff'
    size = 2

    constructor(position: Vector, velocity: Vector) {
        this.position = position
        this.velocity = velocity
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

function App() {
    const graphicContext = useRef<CanvasRenderingContext2D | null>(null)

    useEffect(() => {
        if (graphicContext.current) {
            const ctx = graphicContext.current
            let { width, height } = ctx.canvas

            const resize = () => {
                if (graphicContext.current) {
                    graphicContext.current.canvas.width = window.innerWidth
                    graphicContext.current.canvas.height = window.innerHeight
                    height = window.innerHeight
                    width = window.innerWidth
                }
            }

            window.addEventListener('resize', resize)
            resize()

            let particles: Array<Particle> = []
            for (let i = 0; i < 100; i++) {
                particles.push(
                    new Particle(
                        {
                            x: Math.random() * width,
                            y: Math.random() * height,
                        },
                        {
                            x: Math.random() * 2 - 1,
                            y: Math.random() * 2 - 1,
                        }
                    )
                )
            }

            const animate = () => {
                ctx.clearRect(0, 0, width, height)

                particles.forEach((particle) => {
                    if (particle.position.x > width || particle.position.x < 0) {
                        particle.velocity.x *= -1
                    }
                    if (particle.position.y > height || particle.position.y < 0) {
                        particle.velocity.y *= -1
                    }
                    particle.update()
                    particle.draw(ctx)
                })
                connect()
                requestAnimationFrame(animate)
            }

            const connect = () => {
                particles.forEach((particle, i) => {
                    for (let j = i; j < particles.length; j++) {
                        const particle2 = particles[j]
                        const distance =
                            Math.pow(particle.position.x - particle2.position.x, 2) +
                            Math.pow(particle.position.y - particle2.position.y, 2)
                        if (distance < (width * height) / 100) {
                            ctx.strokeStyle = '#dddddd'
                            ctx.lineWidth = 1
                            ctx.beginPath()
                            ctx.moveTo(particle.position.x, particle.position.y)
                            ctx.lineTo(particle2.position.x, particle2.position.y)
                            ctx.stroke()
                        }
                    }
                })
            }

            animate()
        }
    }, [graphicContext])

    return (
        <div className="App">
            <canvas
                ref={(reference: HTMLCanvasElement) => {
                    graphicContext.current = reference.getContext('2d')
                }}
                style={{
                    position: 'absolute',
                    width: '100vw',
                    height: '100vh',
                    top: 0,
                    left: 0,
                }}
            />
            <h1>Particles.</h1>
        </div>
    )
}

export default App
