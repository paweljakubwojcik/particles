import { useEffect, useRef } from 'react'
import './App.css'

type Vector = {
    x: number
    y: number
}

type ParticleConfig = {
    position: Vector
    velocity?: Vector
    size?: number
    color?: string
    id?: string | number
}
class Particle {
    private static Particles: { [key: string]: Particle } = {}
    private static nextAvaibleIndex = 0
    position: Vector
    velocity: Vector
    color: string
    size: number
    id: string

    constructor({
        position,
        velocity = { x: 0, y: 0 },
        size = 2,
        color = '#ffffff',
        id,
    }: ParticleConfig) {
        this.position = position
        this.velocity = velocity
        this.size = size
        this.color = color
        if (id) {
            this.id = id.toString()
        } else {
            while (Particle.Particles[Particle.nextAvaibleIndex.toString()]) {
                Particle.nextAvaibleIndex++
            }
            this.id = Particle.nextAvaibleIndex.toString()
        }
        Particle.Particles[this.id] = this
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

    delete() {
        delete Particle.Particles[this.id]
    }

    static getParticleById(id: string | number) {
        return Particle.Particles[id.toString()]
    }

    static getAllParticles() {
        return Object.values(Particle.Particles)
    }
}

function App() {
    const graphicContext = useRef<CanvasRenderingContext2D | null>(null)
    const particlesQuantity = 100

    useEffect(() => {
        if (graphicContext.current) {
            const ctx = graphicContext.current
            const canvasElement = graphicContext.current.canvas
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

            for (let i = 0; i < particlesQuantity; i++) {
                new Particle({
                    position: {
                        x: Math.random() * width,
                        y: Math.random() * height,
                    },
                    velocity: {
                        x: Math.random() * 2 - 1,
                        y: Math.random() * 2 - 1,
                    },
                })
            }

            canvasElement.addEventListener('mouseleave', (e) => {
                Particle.getParticleById('mouseFollower').delete()
            })

            canvasElement.addEventListener('mousemove', (e) => {
                const mouseFollower = Particle.getParticleById('mouseFollower')
                if (mouseFollower) {
                    mouseFollower.position.x = e.x
                    mouseFollower.position.y = e.y
                } else {
                    new Particle({
                        position: {
                            x: 0,
                            y: 0,
                        },
                        id: 'mouseFollower',
                        size: 1,
                    })
                }
            })

            canvasElement.addEventListener('click', (e) => {
                let mouseParticles: Array<Particle> = []
                let quantity = Math.floor(Math.random() * 7) + 3
                for (let i = 0; i < quantity; i++) {
                    mouseParticles.push(
                        new Particle({
                            position: { x: e.x, y: e.y },
                            velocity: {
                                x: 2 * Math.cos((i * Math.PI * 2) / quantity),
                                y: 2 * Math.sin((i * Math.PI * 2) / quantity),
                            },
                        })
                    )
                }

                setTimeout(() => {
                    mouseParticles.forEach((particle) => {
                        particle.delete()
                    })
                }, 1500)
            })

            const animate = () => {
                ctx.clearRect(0, 0, width, height)

                Particle.getAllParticles().forEach((particle) => {
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
                Particle.getAllParticles().forEach((particle, i) => {
                    for (let j = i; j < Particle.getAllParticles().length; j++) {
                        const particle2 = Particle.getAllParticles()[j]
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
    }, [graphicContext, particlesQuantity])

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
